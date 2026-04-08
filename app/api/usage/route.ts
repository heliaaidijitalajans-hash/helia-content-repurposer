import { NextResponse } from "next/server";
import {
  DEFAULT_TEXT_CREDITS,
  DEFAULT_VIDEO_CREDITS,
  LOW_TEXT_CREDITS_THRESHOLD,
  LOW_VIDEO_CREDITS_THRESHOLD,
} from "@/lib/credits/constants";
import { createClient } from "@/lib/supabase/server";
import { checkUserProSubscription } from "@/lib/subscription/plan";
import {
  FREE_REPURPOSE_LIMIT,
  FREE_TRANSCRIBE_LIMIT,
  PRO_TRANSCRIBE_LIMIT,
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

  const isPro = await checkUserProSubscription(supabase);

  const { data: row, error } = await supabase
    .from("usage")
    .select("request_count, transcribe_count, text_credits, video_credits")
    .eq("user_id", user.id)
    .maybeSingle();
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
      textCredits: DEFAULT_TEXT_CREDITS,
      videoCredits: DEFAULT_VIDEO_CREDITS,
      creditsLow: false,
      isPro,
    });
  }

  const used = row?.request_count ?? 0;
  const transcribeUsed =
    typeof row?.transcribe_count === "number" ? row.transcribe_count : 0;
  const textCredits =
    typeof row?.text_credits === "number" ? row.text_credits : DEFAULT_TEXT_CREDITS;
  const videoCredits =
    typeof row?.video_credits === "number"
      ? row.video_credits
      : DEFAULT_VIDEO_CREDITS;

  const creditsLow =
    !isPro &&
    (textCredits <= LOW_TEXT_CREDITS_THRESHOLD ||
      videoCredits <= LOW_VIDEO_CREDITS_THRESHOLD);

  return NextResponse.json({
    used,
    limit: FREE_REPURPOSE_LIMIT,
    transcribeUsed,
    transcribeLimit,
    textCredits,
    videoCredits,
    creditsLow,
    isPro,
  });
}
