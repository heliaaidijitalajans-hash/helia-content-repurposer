import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  FREE_REPURPOSE_LIMIT,
  FREE_TRANSCRIBE_LIMIT,
  PRO_TRANSCRIBE_LIMIT,
} from "@/lib/usage/free-tier";
import { getSubscriptionPlan } from "@/lib/subscription/plan";

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

  const plan = await getSubscriptionPlan(supabase, user.id);
  const isPro = plan === "pro";
  const transcribeLimit = isPro
    ? PRO_TRANSCRIBE_LIMIT
    : FREE_TRANSCRIBE_LIMIT;

  if (error) {
    console.warn("usage select:", error.message);
    return NextResponse.json({
      used: 0,
      limit: FREE_REPURPOSE_LIMIT,
      transcribeUsed: 0,
      transcribeLimit,
      isPro,
    });
  }

  const used = row?.request_count ?? 0;
  const transcribeUsed =
    typeof row?.transcribe_count === "number" ? row.transcribe_count : 0;

  return NextResponse.json({
    used,
    limit: FREE_REPURPOSE_LIMIT,
    transcribeUsed,
    transcribeLimit,
    isPro,
  });
}
