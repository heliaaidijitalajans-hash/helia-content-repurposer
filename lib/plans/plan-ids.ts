/**
 * Stable `public.plans.id` values (migration 015). Use with POST /api/select-plan `{ planId }`.
 */
export const PLANS_DB_ID = {
  FREE: "a0000001-0000-4000-8000-000000000001",
  AYLIK: "a0000001-0000-4000-8000-000000000002",
  PRO: "a0000001-0000-4000-8000-000000000003",
  YEARLY: "a0000001-0000-4000-8000-000000000004",
} as const;

export type PlanDbId = (typeof PLANS_DB_ID)[keyof typeof PLANS_DB_ID];
