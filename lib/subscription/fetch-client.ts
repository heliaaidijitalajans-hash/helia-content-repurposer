"use client";

import { createClient } from "@/lib/supabase/client";
import type { SubscriptionPlan } from "@/lib/subscription/plan";

/**
 * Current session user + row from `public.subscriptions` (RLS: own row only).
 * `null` plan = not signed in or missing row (treat as free in callers).
 */
export async function fetchUserSubscriptionFromSupabase(): Promise<{
  plan: SubscriptionPlan | null;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { plan: null };
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("[subscription] client fetch:", error.message);
      return { plan: "free" };
    }

    const raw = data?.plan;
    if (raw === "pro") return { plan: "pro" };
    if (raw === "free") return { plan: "free" };
    return { plan: "free" };
  } catch {
    return { plan: null };
  }
}
