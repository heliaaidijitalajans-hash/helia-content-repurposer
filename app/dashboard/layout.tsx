import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/standalone/require-session";

export const metadata: Metadata = {
  title: "Dashboard | Helia AI",
  description: "Helia AI workspace",
};

export default async function DashboardShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("/dashboard");
  return <AppShell>{children}</AppShell>;
}
