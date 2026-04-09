import type { PlansTableName } from "@/lib/plans/normalize-plan-name";

/**
 * Canonical `public.plans.name` values (migration 014).
 * Use these in pricing CTAs so POST /api/select-plan always matches the DB.
 */
export const PLANS_DB_NAME = {
  FREE: "free",
  AYLIK: "aylik",
  PRO: "pro",
  YEARLY: "yearly",
} as const satisfies Record<string, PlansTableName>;
