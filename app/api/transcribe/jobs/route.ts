import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Son transkripsiyon işleri; `?active=1` ile yalnızca pending/processing. */
export async function GET(req: Request): Promise<Response> {
  try {
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

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "1";

    let query = supabase
      .from("transcription_jobs")
      .select(
        "id,status,source_type,youtube_url,error_message,created_at,updated_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25);

    if (activeOnly) {
      query = query.in("status", ["pending", "processing"]);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data ?? [] });
  } catch (e) {
    console.error("[api/transcribe/jobs]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
