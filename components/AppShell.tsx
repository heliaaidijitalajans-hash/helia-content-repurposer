import { NextIntlClientProvider } from "next-intl";
import { Layout } from "@/components/Layout";
import { isAdminEmail } from "@/lib/admin/config";
import { getStandaloneLocale } from "@/lib/account/load-copy";
import { createClient } from "@/lib/supabase/server";

export async function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const showAdminLink = isAdminEmail(user?.email);
  const locale = await getStandaloneLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Layout showAdminLink={showAdminLink}>{children}</Layout>
    </NextIntlClientProvider>
  );
}
