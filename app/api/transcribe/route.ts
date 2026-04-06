import OpenAI from "openai";
import { toFile } from "openai";
import { createClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import {
  FREE_TRANSCRIBE_LIMIT,
  PRO_TRANSCRIBE_LIMIT,
} from "@/lib/usage/free-tier";
import { userHasProPlan } from "@/lib/usage/is-pro";

/** Node required: OpenAI SDK + multipart parsing + Buffer */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Long audio can exceed 60s; Vercel caps by plan (e.g. 60s Hobby, 300s Pro). */
export const maxDuration = 300;

const FIELD_NAME = "file";

const ALLOWED_EXT = new Set(["mp3", "wav", "mp4"]);

const ALLOWED_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "video/mp4",
]);

/** OpenAI Whisper upload limit */
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

function firstRpcRow(
  data: unknown,
): QuotaRpcRow | null {
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

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      return Response.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
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
        { error: "Unsupported file type. Allowed: mp3, wav, mp4." },
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

    const { isConfigured } = getPublicSupabaseConfig();
    if (!isConfigured) {
      return Response.json(
        {
          error:
            "Transcription quota requires Supabase. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
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

    if (!userHasProPlan(user)) {
      return Response.json(
        {
          error: "Upgrade to use video transcription",
          code: "TRANSCRIBE_PRO_REQUIRED",
        },
        { status: 403 },
      );
    }

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

    const buffer = Buffer.from(await entry.arrayBuffer());
    const ext = extensionOf(entry.name || "");
    const safeName =
      entry.name?.trim() || (ext ? `upload.${ext}` : "upload.mp3");

    const uploadable = await toFile(buffer, safeName, {
      type: entry.type || undefined,
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 240_000,
      maxRetries: 2,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: uploadable,
      model: "whisper-1",
    });

    const text =
      typeof transcription.text === "string" ? transcription.text : "";
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
