import type { PlansTableName } from "@/lib/plans/normalize-plan-name";

/**
 * Supabase `public.plans.name` / `public.users.plan` sabitleri (aylık = Türkçe ı).
 */
export const PLANS_DB_NAME = {
  FREE: "free",
  AYLIK: "aylık",
  PRO: "pro",
  YEARLY: "yearly",
} as const satisfies Record<string, PlansTableName>;
