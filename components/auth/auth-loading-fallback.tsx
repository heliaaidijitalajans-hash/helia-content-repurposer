"use client";

import { useTranslations } from "next-intl";

export function AuthLoadingFallback() {
  const t = useTranslations("common");
  return (
    <div className="notranslate relative flex min-h-screen items-center justify-center overflow-x-hidden bg-gradient-to-br from-[#0a1628] via-slate-950 to-[#020617] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(99,102,241,0.35),transparent)] opacity-[0.35]"
        aria-hidden
      />
      <p className="relative z-10 text-sm text-slate-400">{t("loading")}</p>
    </div>
  );
}
