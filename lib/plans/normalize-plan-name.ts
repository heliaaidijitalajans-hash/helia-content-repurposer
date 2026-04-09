/** DB `plans.name` values (see migration 014). */
export type PlansTableName = "free" | "aylik" | "pro" | "yearly";

const ALIASES: Record<string, PlansTableName> = {
  free: "free",
  aylik: "aylik",
  monthly: "aylik",
  pro: "pro",
  yearly: "yearly",
};

/** Map URL/marketing keys (e.g. monthly) to `public.plans.name`. */
export function normalizePlanNameForDb(raw: string | undefined): PlansTableName | null {
  if (raw == null || raw === "") return null;
  const k = raw.trim().toLowerCase();
  return ALIASES[k] ?? null;
}

export function isPaidAppPlan(plan: PlansTableName): boolean {
  return plan !== "free";
}
