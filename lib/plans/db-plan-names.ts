import type { PlansTableName } from "@/lib/plans/normalize-plan-name";

/**
 * Canonical `public.plans.name` values (migration 014).
 * Canonical names for `public.users.plan` / checks. Pricing uses `PLANS_DB_ID` + POST /api/select-plan.
 */
export const PLANS_DB_NAME = {
  FREE: "free",
  AYLIK: "aylik",
  PRO: "pro",
  YEARLY: "yearly",
} as const satisfies Record<string, PlansTableName>;
