import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";
import { checkUserProSubscription } from "@/lib/subscription/plan";

/**
 * `checkUserProSubscription` sonucu — gövde her zaman `{ isPro: boolean }`, HTTP 200.
 */
export async function GET() {
  try {
    if (FORCE_VIDEO_FEATURE_ENABLED) {
      return NextResponse.json({ isPro: true }, { status: 200 });
    }

    const supabase = await createClient();
    const isPro = await checkUserProSubscription(supabase);
    return NextResponse.json(
      { isPro: isPro === true },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/subscription-status]", error);
    return NextResponse.json({ isPro: false }, { status: 200 });
  }
}
