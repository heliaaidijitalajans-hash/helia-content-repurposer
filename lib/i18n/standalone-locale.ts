import { routing } from "@/i18n/routing";

/** Locale öneki olmayan sayfalar (`/dashboard` vb.) bu çerezden okunur. */
export const STANDALONE_LOCALE_COOKIE = "NEXT_LOCALE";

export type AppLocaleCode = "tr" | "en";

export function parseStandaloneLocale(
  value: string | undefined | null,
): AppLocaleCode {
  if (value === "en" || value === "tr") return value;
  return routing.defaultLocale as AppLocaleCode;
}

/** Örn. `/en/features` → `en` (çerez senkronu için). */
export function localeFromPathname(pathname: string): AppLocaleCode | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/tr" || pathname.startsWith("/tr/")) return "tr";
  return null;
}

/** İstemci: dil seçilince çerez yazılır; standalone sayfalar sunucuda doğru mesajı yükler. */
export function setStandaloneLocaleCookieClient(locale: AppLocaleCode): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${STANDALONE_LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};SameSite=Lax`;
}
