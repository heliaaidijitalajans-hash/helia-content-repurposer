/**
 * Next.js App Router: this file must stay at `app/api/transcribe/route.ts`
 * (not under `app/[locale]/…`). The URL is always `/api/transcribe` (no locale prefix).
 */
import { createClient } from "@/lib/supabase/server";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";
import { PRO_TRANSCRIBE_LIMIT } from "@/lib/usage/free-tier";
import { checkUserProSubscription } from "@/lib/subscription/plan";
import { inngest } from "@/inngest/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Bu uç nokta yalnızca kuyruğa yazar; ağır iş Inngest’te. */
export const maxDuration = 60;

type QuotaRpcRow = { allowed: boolean; current_count: number };

function firstRpcRow(data: unknown): QuotaRpcRow | null {
  if (data == null) return null;
  if (Array.isArray(data)) {
    const row = data[0];
    if (
      row &&
      typeof row === "object" &&
      "allowed" in row &&
      "current_count" in row
    ) {
      return row as QuotaRpcRow;
    }
    return null;
  }
  if (
    typeof data === "object" &&
    "allowed" in data &&
    "current_count" in data
  ) {
    return data as QuotaRpcRow;
  }
  return null;
}

async function consumeTranscribeQuotaIfNeeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Response | null> {
  if (FORCE_VIDEO_FEATURE_ENABLED) return null;

  const { data: quotaData, error: quotaError } = await supabase.rpc(
    "consume_transcribe_quota",
    { p_limit: PRO_TRANSCRIBE_LIMIT },
  );

  if (quotaError) {
    console.error(quotaError);
    return Response.json(
      { error: "Could not verify transcription quota." },
      { status: 500 },
    );
  }

  const quotaRow = firstRpcRow(quotaData);
  if (!quotaRow || !quotaRow.allowed) {
    return Response.json(
      {
        error:
          "Transcription limit reached for your plan. Contact support if you need a higher limit.",
        code: "TRANSCRIBE_QUOTA",
        used: quotaRow?.current_count ?? PRO_TRANSCRIBE_LIMIT,
        limit: PRO_TRANSCRIBE_LIMIT,
      },
      { status: 403 },
    );
  }

  return null;
}

/** Quick check that the route is mounted (e.g. open http://localhost:3000/api/transcribe). */
export async function GET(): Promise<Response> {
  return Response.json({
    ok: true,
    path: "/api/transcribe",
    post: {
      description: "Enqueue a transcription job",
      body: { storagePaths: "non-empty string[] of user-scoped storage paths" },
      success: { jobId: "uuid", shape: { success: true, jobId: "uuid" } },
    },
  });
}

/**
 * Transkripsiyon işini kuyruğa alır — JSON { success: true, jobId }.
 * Insert uses the service role so RLS never blocks the row creation.
 */
export async function POST(req: Request): Promise<Response> {
  console.log("API HIT");
  try {
    const { isConfigured } = getPublicSupabaseConfig();
    if (!isConfigured) {
      return Response.json(
        {
          error:
            "Transcription requires Supabase. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        },
        { status: 503 },
      );
    }

    if (!isServiceRoleConfigured()) {
      return Response.json(
        {
          error:
            "Async transcribe requires SUPABASE_SERVICE_ROLE_KEY (worker updates jobs). See .env.example.",
        },
        { status: 503 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownerId = user.id;

    const isPro = await checkUserProSubscription(supabase);
    if (!isPro) {
      return Response.json({ error: "Upgrade required" }, { status: 403 });
    }

    let body: { storagePaths?: unknown };
    try {
      body = (await req.json()) as { storagePaths?: unknown };
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const rawPaths = Array.isArray(body.storagePaths) ? body.storagePaths : [];
    const paths = rawPaths.filter(
      (p): p is string => typeof p === "string" && p.length > 0,
    );

    if (paths.length === 0) {
      return Response.json(
        {
          error:
            "Send storagePaths: a non-empty array of storage object paths.",
        },
        { status: 400 },
      );
    }

    const prefix = `${ownerId}/`;
    for (const p of paths) {
      if (!p.startsWith(prefix) || p.includes("..") || p.includes("//")) {
        return Response.json({ error: "Invalid storage path" }, { status: 400 });
      }
    }

    const quotaErr = await consumeTranscribeQuotaIfNeeded(supabase);
    if (quotaErr) return quotaErr;

    const admin = createServiceRoleClient();

    const { data: job, error: insertError } = await admin
      .from("transcription_jobs")
      .insert({
        user_id: ownerId,
        status: "pending",
        progress: 0,
        source_type: "storage",
        storage_paths: paths,
        youtube_url: null,
      })
      .select("id")
      .single();

    if (insertError || !job?.id) {
      console.error(
        insertError ?? new Error("transcription_jobs insert returned no id"),
      );
      return Response.json(
        { success: false, error: insertError?.message ?? "Could not create job." },
        { status: 500 },
      );
    }

    const jobId = job.id as string;
    console.log("JOB CREATED");

    try {
      await inngest.send({
        name: "transcribe/job.requested",
        data: { jobId },
      });
    } catch (e) {
      console.error(e);
      await admin
        .from("transcription_jobs")
        .update({
          status: "failed",
          error_message:
            "Could not enqueue job. Set INNGEST_EVENT_KEY and deploy the Inngest app (see README).",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return Response.json(
        {
          success: false,
          error:
            "Queue unavailable. Configure INNGEST_EVENT_KEY and run Inngest with your deployment.",
        },
        { status: 503 },
      );
    }

    return Response.json({ success: true, jobId });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Transcription failed";
    return Response.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
