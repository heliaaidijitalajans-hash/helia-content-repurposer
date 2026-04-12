import type en from "@/messages/en.json";

export type CheckoutPageCopy = (typeof en)["checkoutPage"];

type PlanPriceRow = {
  name: string;
  price_display_tr: string | null;
  price_display_en: string | null;
};

/** `public.plans.name` → checkout copy alanı. */
const DB_NAME_TO_PRICE_KEY: Record<string, keyof CheckoutPageCopy> = {
  free: "planFreePrice",
  aylık: "planMonthlyPrice",
  pro: "planProPrice",
  yearly: "planYearlyPrice",
};

/**
 * Veritabanında doldurulmuş fiyat metinleri varsa ödeme sayfası kopyasının ilgili price alanlarını günceller.
 */
export function mergePlanPricesFromDb(
  copy: CheckoutPageCopy,
  rows: PlanPriceRow[] | null | undefined,
  locale: string,
): CheckoutPageCopy {
  if (!rows?.length) return copy;
  let next: CheckoutPageCopy = { ...copy };
  for (const row of rows) {
    const key = DB_NAME_TO_PRICE_KEY[row.name];
    if (!key) continue;
    const p =
      locale === "tr"
        ? row.price_display_tr?.trim()
        : row.price_display_en?.trim();
    if (p) {
      next = { ...next, [key]: p };
    }
  }
  return next;
}
