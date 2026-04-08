"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = { tr: "Türkçe", en: "English" };

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function select(nextLocale: string) {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("language")}
      >
        <span className="text-gray-500" aria-hidden>
          ◐
        </span>
        {labels[locale] ?? locale}
        <span className="text-[10px] text-gray-500" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {routing.locales.map((loc) => (
            <li key={loc} role="none">
              <button
                type="button"
                role="option"
                aria-selected={loc === locale}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-100 ${
                  loc === locale
                    ? "font-semibold text-gray-900"
                    : "text-gray-800"
                }`}
                onClick={() => select(loc)}
              >
                {labels[loc]}
                {loc === locale ? (
                  <span className="text-xs text-gray-600">✓</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
