"use client";

import { useTranslations } from "next-intl";

export function AuthLoadingFallback() {
  const t = useTranslations("common");
  return (
    <div className="notranslate flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500">{t("loading")}</p>
    </div>
  );
}
