import OpenAI from "openai";
import { toFile } from "openai";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { TRANSCRIBE_TEMP_BUCKET } from "@/lib/storage/transcribe-bucket";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";
import { PRO_TRANSCRIBE_LIMIT } from "@/lib/usage/free-tier";
import { checkUserProSubscription } from "@/lib/subscription/plan";

/** Node required: OpenAI SDK + multipart / Storage */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Uzun ses / çok parça transkripsiyon için (Vercel Pro). */
export const maxDuration = 300;

const FIELD_NAME = "file";

const ALLOWED_EXT = new Set(["mp3", "wav", "mp4", "m4a"]);

const ALLOWED_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "video/mp4",
]);

/** OpenAI Whisper tek dosya limiti */
const MAX_BYTES = 25 * 1024 * 1024;

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function isAllowedUpload(file: File): boolean {
  const ext = extensionOf(file.name || "");
  if (ALLOWED_EXT.has(ext)) return true;
  const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
  return mime !== "" && ALLOWED_MIME.has(mime);
}

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

async function transcribeBuffer(
  openai: OpenAI,
  buffer: Buffer,
  filename: string,
  contentType?: string,
): Promise<string> {
  const uploadable = await toFile(buffer, filename, {
    type: contentType || undefined,
  });
  const transcription = await openai.audio.transcriptions.create({
    file: uploadable,
    model: "whisper-1",
  });
  return typeof transcription.text === "string" ? transcription.text : "";
}

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      return Response.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
      );
    }

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

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json") && !isServiceRoleConfigured()) {
      return Response.json(
        {
          error:
            "JSON + Storage transcribe requires SUPABASE_SERVICE_ROLE_KEY on the server (see .env.example).",
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 240_000,
      maxRetries: 2,
    });

    if (contentType.includes("application/json")) {
      let body: { storagePath?: unknown; storagePaths?: unknown };
      try {
        body = (await req.json()) as {
          storagePath?: unknown;
          storagePaths?: unknown;
        };
      } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const rawPaths = Array.isArray(body.storagePaths)
        ? body.storagePaths
        : typeof body.storagePath === "string"
          ? [body.storagePath]
          : [];
      const paths = rawPaths.filter(
        (p): p is string => typeof p === "string" && p.length > 0,
      );

      if (paths.length === 0) {
        return Response.json(
          { error: "Provide storagePath (string) or storagePaths (string[])." },
          { status: 400 },
        );
      }

      const prefix = `${user.id}/`;
      for (const p of paths) {
        if (!p.startsWith(prefix) || p.includes("..") || p.includes("//")) {
          return Response.json({ error: "Invalid storage path" }, { status: 400 });
        }
      }

      const quotaErr = await consumeTranscribeQuotaIfNeeded(supabase);
      if (quotaErr) return quotaErr;

      const admin = createServiceRoleClient();
      const texts: string[] = [];

      try {
        for (const p of paths) {
          const { data: blob, error: dlErr } = await admin.storage
            .from(TRANSCRIBE_TEMP_BUCKET)
            .download(p);

          if (dlErr || !blob) {
            console.error("[api/transcribe] storage download:", dlErr?.message);
            return Response.json(
              { error: "Could not read file from storage." },
              { status: 502 },
            );
          }

          const buffer = Buffer.from(await blob.arrayBuffer());
          if (buffer.length === 0) {
            return Response.json({ error: "Empty file in storage" }, { status: 400 });
          }
          if (buffer.length > MAX_BYTES) {
            return Response.json(
              { error: "File too large (max 25MB per OpenAI Whisper segment)" },
              { status: 400 },
            );
          }

          const name = p.split("/").pop() || "audio.m4a";
          const textPart = await transcribeBuffer(
            openai,
            buffer,
            name,
            "audio/mp4",
          );
          texts.push(textPart.trim());
        }
      } finally {
        await admin.storage
          .from(TRANSCRIBE_TEMP_BUCKET)
          .remove(paths)
          .catch((err: Error) =>
            console.warn("[api/transcribe] storage cleanup:", err?.message),
          );
      }

      return Response.json({
        text: texts.filter((t) => t.length > 0).join("\n\n"),
      });
    }

    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        {
          error:
            "Use multipart/form-data with field \"file\" or application/json with storagePaths.",
        },
        { status: 415 },
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return Response.json(
        { error: "Invalid or empty multipart body" },
        { status: 400 },
      );
    }

    const entry = formData.get(FIELD_NAME);
    if (!entry || !(entry instanceof File)) {
      return Response.json(
        { error: `Missing file: multipart field "${FIELD_NAME}"` },
        { status: 400 },
      );
    }

    if (!isAllowedUpload(entry)) {
      return Response.json(
        { error: "Unsupported file type. Allowed: mp3, wav, mp4, m4a." },
        { status: 400 },
      );
    }

    if (entry.size <= 0) {
      return Response.json({ error: "Empty file" }, { status: 400 });
    }

    if (entry.size > MAX_BYTES) {
      return Response.json(
        { error: "File too large (max 25MB per OpenAI Whisper)" },
        { status: 400 },
      );
    }

    const quotaErrMultipart = await consumeTranscribeQuotaIfNeeded(supabase);
    if (quotaErrMultipart) return quotaErrMultipart;

    const buffer = Buffer.from(await entry.arrayBuffer());
    const ext = extensionOf(entry.name || "");
    const safeName =
      entry.name?.trim() || (ext ? `upload.${ext}` : "upload.mp3");

    const text = await transcribeBuffer(
      openai,
      buffer,
      safeName,
      entry.type || undefined,
    );
    return Response.json({ text });
  } catch (error) {
    console.error("[api/transcribe]", error);

    if (error instanceof OpenAI.APIError) {
      return Response.json(
        { error: error.message || "OpenAI API error" },
        { status: error.status && error.status >= 400 ? error.status : 502 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Transcription failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
