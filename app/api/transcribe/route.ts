import { createClient } from "@/lib/supabase/server";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";
import { PRO_TRANSCRIBE_LIMIT } from "@/lib/usage/free-tier";
import { checkUserProSubscription } from "@/lib/subscription/plan";
import { extractYoutubeVideoId } from "@/lib/youtube/video-id";
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
    console.error("[api/transcribe] quota rpc:", quotaError.message);
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

/**
 * Transkripsiyon işini kuyruğa alır — 202 Accepted + jobId.
 * Gövde: tam olarak biri — `youtubeUrl` (string) veya `storagePaths` (string[], dolu).
 */
export async function POST(req: Request): Promise<Response> {
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

    const isPro = await checkUserProSubscription(supabase);
    if (!isPro) {
      return Response.json({ error: "Upgrade required" }, { status: 403 });
    }

    let body: { storagePaths?: unknown; youtubeUrl?: unknown };
    try {
      body = (await req.json()) as {
        storagePaths?: unknown;
        youtubeUrl?: unknown;
      };
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const ytRaw =
      typeof body.youtubeUrl === "string" ? body.youtubeUrl.trim() : "";
    const rawPaths = Array.isArray(body.storagePaths) ? body.storagePaths : [];
    const paths = rawPaths.filter(
      (p): p is string => typeof p === "string" && p.length > 0,
    );

    const hasYt = ytRaw.length > 0;
    const hasPaths = paths.length > 0;
    if ((hasYt && hasPaths) || (!hasYt && !hasPaths)) {
      return Response.json(
        {
          error:
            "Send exactly one of: youtubeUrl (non-empty string) OR storagePaths (non-empty array).",
        },
        { status: 400 },
      );
    }

    if (hasYt && !extractYoutubeVideoId(ytRaw)) {
      return Response.json({ error: "Invalid YouTube URL." }, { status: 400 });
    }

    if (hasPaths) {
      const prefix = `${user.id}/`;
      for (const p of paths) {
        if (!p.startsWith(prefix) || p.includes("..") || p.includes("//")) {
          return Response.json({ error: "Invalid storage path" }, { status: 400 });
        }
      }
    }

    const quotaErr = await consumeTranscribeQuotaIfNeeded(supabase);
    if (quotaErr) return quotaErr;

    const { data: job, error: insertError } = await supabase
      .from("transcription_jobs")
      .insert({
        user_id: user.id,
        status: "pending",
        source_type: hasYt ? "youtube" : "storage",
        storage_paths: hasPaths ? paths : [],
        youtube_url: hasYt ? ytRaw : null,
      })
      .select("id")
      .single();

    if (insertError || !job?.id) {
      console.error("[api/transcribe] insert job:", insertError?.message);
      return Response.json(
        { error: insertError?.message ?? "Could not create job." },
        { status: 500 },
      );
    }

    const jobId = job.id as string;

    try {
      await inngest.send({
        name: "transcribe/job.requested",
        data: { jobId },
      });
    } catch (e) {
      console.error("[api/transcribe] inngest.send:", e);
      await supabase
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
          error:
            "Queue unavailable. Configure INNGEST_EVENT_KEY and run Inngest with your deployment.",
        },
        { status: 503 },
      );
    }

    return new Response(
      JSON.stringify({
        jobId,
        status: "pending",
        pollUrl: `/api/transcribe/jobs/${jobId}`,
      }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[api/transcribe]", error);
    const message =
      error instanceof Error ? error.message : "Transcription failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
