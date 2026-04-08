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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-gray-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-gray-900 transition hover:text-zinc-600"
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
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 sm:px-5"
          >
            {t("login")}
          </Link>
          <Link
            href={{ pathname: "/auth", query: { next: `/${locale}/dashboard` } }}
            className="rounded-lg border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 sm:px-5"
          >
            {t("ctaPrimary")}
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white px-4 py-2 md:hidden">
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
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
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
