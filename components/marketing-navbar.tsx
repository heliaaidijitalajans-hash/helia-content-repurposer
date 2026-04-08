"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const nav = [
  { href: "/", key: "home" as const },
  { href: "/features", key: "features" as const },
  { href: "/examples", key: "examples" as const },
  { href: "/pricing", key: "pricing" as const },
  { href: "/support", key: "support" as const },
];

function linkActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname === "";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNavbar() {
  const t = useTranslations("marketingNav");
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/10 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-white transition hover:text-sky-200"
        >
          Helia AI
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex lg:gap-2"
          aria-label="Main"
        >
          {nav.map(({ href, key }) => {
            const active = linkActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link
            href="/auth"
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-5"
          >
            {t("login")}
          </Link>
          <Link
            href={{ pathname: "/auth", query: { next: `/${locale}/dashboard` } }}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:bg-blue-400 sm:px-5"
          >
            {t("ctaPrimary")}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md md:hidden">
        <nav
          className="flex max-w-6xl gap-1 overflow-x-auto scrollbar-none sm:mx-auto"
          aria-label="Main mobile"
        >
          {nav.map(({ href, key }) => {
            const active = linkActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
