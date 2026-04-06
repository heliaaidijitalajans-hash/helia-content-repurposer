import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import {
  isLikelyMissingTranscriptionJobsTable,
  logPostgrestError,
} from "@/lib/supabase/postgrest-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await context.params;
    const { isConfigured } = getPublicSupabaseConfig();
    if (!isConfigured) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("transcription_jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logPostgrestError("api/transcribe/jobs/[id]", error);
      if (isLikelyMissingTranscriptionJobsTable(error)) {
        return NextResponse.json(
          {
            error:
              "Transcription jobs table is missing or not exposed. Apply Supabase migration 007_transcription_jobs.sql (see supabase/migrations).",
            code: "TRANSCRIPTION_JOBS_SCHEMA",
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[api/transcribe/jobs/id]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
