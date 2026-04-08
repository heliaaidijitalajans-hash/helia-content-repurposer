import { cookies } from "next/headers";
import type en from "@/messages/en.json";

export type HistoryPageCopy = (typeof en)["historyPage"];

export async function getHistoryPageCopy(): Promise<HistoryPageCopy> {
  const jar = await cookies();
  const c = jar.get("NEXT_LOCALE")?.value;
  const locale = c === "en" ? "en" : "tr";
  if (locale === "en") {
    const mod = await import("@/messages/en.json");
    return mod.default.historyPage;
  }
  const mod = await import("@/messages/tr.json");
  return mod.default.historyPage;
}
