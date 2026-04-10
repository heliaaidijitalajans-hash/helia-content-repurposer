import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin/config";
import { Layout } from "@/components/Layout";

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

  return <Layout showAdminLink={showAdminLink}>{children}</Layout>;
}
