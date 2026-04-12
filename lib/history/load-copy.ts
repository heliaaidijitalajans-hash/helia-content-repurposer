import type en from "@/messages/en.json";
import { getStandaloneLocale } from "@/lib/account/load-copy";

export type HistoryPageCopy = (typeof en)["historyPage"];

export async function getHistoryPageCopy(): Promise<HistoryPageCopy> {
  const locale = await getStandaloneLocale();
  if (locale === "en") {
    const mod = await import("@/messages/en.json");
    return mod.default.historyPage;
  }
  const mod = await import("@/messages/tr.json");
  return mod.default.historyPage;
}
