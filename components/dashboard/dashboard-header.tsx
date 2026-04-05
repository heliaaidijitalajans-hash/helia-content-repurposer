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
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          {tc("brand")}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <span className="hidden max-w-[200px] truncate text-xs text-zinc-500 sm:inline">
            {email}
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-zinc-200/80 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    </header>
  );
}
