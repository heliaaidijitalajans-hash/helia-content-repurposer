import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Admin | Helia AI",
  description: "Kullanıcı ve kredi yönetimi",
};

/** Admin kontrolü `app/admin/page.tsx` istemci bileşeninde (useEffect + router.push). */
export default function AdminShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
