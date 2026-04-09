/** DB `public.plans.name` değerleri (Supabase’de aylık Türkçe karakterli). */
export type PlansTableName = "free" | "aylık" | "pro" | "yearly";

/**
 * Girdi anahtarı → tablodaki tam isim.
 * Küçük harf: tr-TR locale (İ/I/ı) + ASCII yedek (aylik, monthly).
 */
const ALIASES: Record<string, PlansTableName> = {
  free: "free",
  pro: "pro",
  yearly: "yearly",
  aylık: "aylık",
  aylik: "aylık",
  monthly: "aylık",
};

/** `public.plans.name` ve `public.users.plan` ile birebir eşleşen anahtar. */
export function normalizePlanNameForDb(raw: string | undefined): PlansTableName | null {
  if (raw == null || raw === "") return null;
  const trimmed = raw.trim();
  const tr = trimmed.toLocaleLowerCase("tr-TR");
  if (ALIASES[tr] !== undefined) return ALIASES[tr];
  const ascii = trimmed.toLowerCase();
  if (ALIASES[ascii] !== undefined) return ALIASES[ascii];
  return null;
}

export function isPaidAppPlan(plan: PlansTableName): boolean {
  return plan !== "free";
}
