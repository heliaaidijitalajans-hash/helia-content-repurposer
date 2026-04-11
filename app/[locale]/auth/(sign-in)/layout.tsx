import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Giriş / kayıt formu — oturum varsa dashboard'a. OAuth callback bu grupta değil. */
export default async function AuthSignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return children;
}
