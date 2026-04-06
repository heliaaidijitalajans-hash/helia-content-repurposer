import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  FREE_REPURPOSE_LIMIT,
  FREE_TRANSCRIBE_LIMIT,
} from "@/lib/usage/free-tier";

/** Mevcut kullanıcı için free tier kullanım sayısı (dashboard göstergesi). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: row, error } = await supabase
    .from("usage")
    .select("request_count, transcribe_count")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("usage select:", error.message);
    return NextResponse.json({
      used: 0,
      limit: FREE_REPURPOSE_LIMIT,
      transcribeUsed: 0,
      transcribeLimit: FREE_TRANSCRIBE_LIMIT,
    });
  }

  const used = row?.request_count ?? 0;
  const transcribeUsed =
    typeof row?.transcribe_count === "number" ? row.transcribe_count : 0;

  return NextResponse.json({
    used,
    limit: FREE_REPURPOSE_LIMIT,
    transcribeUsed,
    transcribeLimit: FREE_TRANSCRIBE_LIMIT,
  });
}
