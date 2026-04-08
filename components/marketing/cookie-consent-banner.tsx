"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie_consent";

type Props = {
  locale: string;
};

export function CookieConsentBanner({ locale }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== "accepted" && stored !== "rejected") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const policyHref = `/${locale}/cookie-policy`;

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const reject = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "rejected");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Çerez tercihleri"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[100] rounded-t-xl border-t border-blue-200/70 bg-white/95 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(30,58,138,0.15)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm leading-relaxed text-gray-700">
          Bu site, deneyiminizi geliştirmek için çerezler kullanır. Detaylı
          bilgi için{" "}
          <Link
            href={policyHref}
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Çerez Politikamızı
          </Link>{" "}
          inceleyebilirsiniz.
        </p>
        <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={reject}
            className="order-2 rounded-lg border border-blue-200/80 bg-blue-50/80 px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-blue-100/80 sm:order-1"
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={accept}
            className="order-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:order-2"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </aside>
  );
}
