import type en from "@/messages/en.json";
import { getStandaloneLocale } from "@/lib/account/load-copy";

export type DashboardHomePageCopy = (typeof en)["dashboardHomePage"];

export async function getDashboardHomePageCopy(): Promise<DashboardHomePageCopy> {
  const locale = await getStandaloneLocale();
  if (locale === "en") {
    const mod = await import("@/messages/en.json");
    return mod.default.dashboardHomePage;
  }
  const mod = await import("@/messages/tr.json");
  return mod.default.dashboardHomePage;
}
