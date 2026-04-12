import { cookies, headers } from "next/headers";
import type en from "@/messages/en.json";
import {
  parseStandaloneLocale,
  STANDALONE_LOCALE_COOKIE,
} from "@/lib/i18n/standalone-locale";

export type AccountPageCopy = (typeof en)["accountPage"];

export async function getStandaloneLocale() {
  const h = await headers();
  const fromHeader = h.get("x-next-intl-locale");
  if (fromHeader === "en" || fromHeader === "tr") {
    return fromHeader;
  }
  const jar = await cookies();
  const c = jar.get(STANDALONE_LOCALE_COOKIE)?.value;
  return parseStandaloneLocale(c);
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
