import { cookies } from "next/headers";
import type en from "@/messages/en.json";

export type AccountPageCopy = (typeof en)["accountPage"];

export async function getStandaloneLocale(): Promise<"tr" | "en"> {
  const jar = await cookies();
  const c = jar.get("NEXT_LOCALE")?.value;
  return c === "en" ? "en" : "tr";
}

export async function getAccountPageCopy(): Promise<AccountPageCopy> {
  const locale = await getStandaloneLocale();
  if (locale === "en") {
    const mod = await import("@/messages/en.json");
    return mod.default.accountPage;
  }
  const mod = await import("@/messages/tr.json");
  return mod.default.accountPage;
}
