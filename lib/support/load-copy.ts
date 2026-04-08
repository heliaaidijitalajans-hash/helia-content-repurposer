import type en from "@/messages/en.json";
import { getStandaloneLocale } from "@/lib/account/load-copy";

export type SupportPageCopy = (typeof en)["supportPage"];

export async function getSupportPageCopy(): Promise<SupportPageCopy> {
  const locale = await getStandaloneLocale();
  if (locale === "en") {
    const mod = await import("@/messages/en.json");
    return mod.default.supportPage;
  }
  const mod = await import("@/messages/tr.json");
  return mod.default.supportPage;
}
