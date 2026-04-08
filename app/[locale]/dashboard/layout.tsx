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
    <div className="notranslate min-h-screen bg-white text-gray-900">
      <DashboardHeader email={user.email ?? ""} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-700">
            {t("workspaceEyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("subtitle")}{" "}
            <Link
              href="/"
              className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
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
