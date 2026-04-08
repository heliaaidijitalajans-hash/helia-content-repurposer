import type en from "@/messages/en.json";
import { getStandaloneLocale } from "@/lib/account/load-copy";

export type MarketingFooterCopy = (typeof en)["marketingFooter"];

export async function getMarketingFooterCopy(): Promise<{
  locale: "tr" | "en";
  copy: MarketingFooterCopy;
}> {
  const locale = await getStandaloneLocale();
  if (locale === "en") {
    const mod = await import("@/messages/en.json");
    return { locale, copy: mod.default.marketingFooter };
  }
  const mod = await import("@/messages/tr.json");
  return { locale, copy: mod.default.marketingFooter };
}
