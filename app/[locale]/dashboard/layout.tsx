import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LocaleDashboardLayout({
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
      href: { pathname: "/auth", query: { next: "/dashboard" } },
      locale,
    });
  }

  return <>{children}</>;
}
