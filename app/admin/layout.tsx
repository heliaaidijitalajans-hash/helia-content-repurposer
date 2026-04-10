import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const metadata: Metadata = {
  title: "Admin | Helia AI",
  description: "Kullanıcı ve kredi yönetimi",
};

export default async function AdminShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminPage();
  return <AppShell>{children}</AppShell>;
}
