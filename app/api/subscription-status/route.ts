import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserProSubscription } from "@/lib/subscription/plan";

/**
 * `checkUserProSubscription` sonucu — gövde her zaman `{ isPro: boolean }`, HTTP 200.
 */
export async function GET() {
  try {
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
