import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({
      href: {
        pathname: "/auth",
        query: { next: `/${locale}/dashboard` },
      },
      locale,
    });
  }

  const t = await getTranslations("dashboard");

  return (
    <div className="notranslate min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader email={user.email ?? ""} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
            {t("workspaceEyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}{" "}
            <Link
              href="/"
              className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              {t("backToHome")}
            </Link>
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
