"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type Props = {
  email: string;
};

export function DashboardHeader({ email }: Props) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-gray-900 shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-gray-900 transition hover:text-blue-700"
        >
          {tc("brand")}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <span className="hidden max-w-[200px] truncate text-xs text-gray-500 sm:inline">
            {email}
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-100"
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    </header>
  );
}
