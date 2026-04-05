import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
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

  if (user) {
    return redirect({ href: "/dashboard", locale });
  }

  return children;
}
