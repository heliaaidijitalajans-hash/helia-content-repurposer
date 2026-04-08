"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  HeliaLogoMark,
  HeliaLogoWordmark,
  heliaLogoLinkClass,
} from "@/components/brand/helia-logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const nav = [
  { href: "/", key: "home" as const },
  { href: "/features", key: "features" as const },
  { href: "/about", key: "about" as const },
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

  return (
    <header className="sticky top-0 z-50 border-b border-blue-200/60 bg-white/85 text-slate-900 shadow-sm shadow-blue-900/5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className={`shrink-0 ${heliaLogoLinkClass}`}
          aria-label="Helia AI home"
        >
          <HeliaLogoMark />
          <HeliaLogoWordmark />
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
                    ? "text-blue-600"
                    : "text-slate-800 hover:text-blue-600"
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
            className="rounded-lg border border-blue-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-blue-900/5 transition hover:bg-blue-50/90 sm:px-5"
          >
            {t("login")}
          </Link>
          <Link
            href={{ pathname: "/auth", query: { next: "/dashboard" } }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-5"
          >
            {t("ctaPrimary")}
          </Link>
        </div>
      </div>

      <div className="border-t border-blue-100/80 bg-blue-50/40 px-4 py-2 backdrop-blur-sm md:hidden">
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
                    ? "text-blue-600"
                    : "text-slate-800 hover:text-blue-600"
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
