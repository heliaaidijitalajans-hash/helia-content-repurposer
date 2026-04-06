import type { PostgrestError } from "@supabase/supabase-js";

export function logPostgrestError(context: string, error: PostgrestError): void {
  console.error(`[${context}] Supabase/PostgREST:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

/** Tablo yok / şema önbelleğinde yok gibi durumlar. */
export function isLikelyMissingTranscriptionJobsTable(
  error: PostgrestError,
): boolean {
  const msg = (error.message || "").toLowerCase();
  const code = error.code || "";
  if (code === "42P01") return true;
  if (code === "PGRST205") return true;
  if (msg.includes("transcription_jobs") && msg.includes("does not exist")) {
    return true;
  }
  if (msg.includes("schema cache") && msg.includes("transcription_jobs")) {
    return true;
  }
  return false;
}
