"use client";

import { useTranslations } from "next-intl";

export function AuthLoadingFallback() {
  const t = useTranslations("common");
  return (
    <div className="notranslate flex min-h-screen items-center justify-center bg-white text-gray-900">
      <p className="text-sm text-gray-600">{t("loading")}</p>
    </div>
  );
}
