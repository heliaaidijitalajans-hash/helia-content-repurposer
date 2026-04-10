import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/standalone/require-session";

export const metadata: Metadata = {
  title: "History | Helia AI",
  description: "Your generated threads, carousels, and more",
};

export default async function HistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("/history");
  return <AppShell>{children}</AppShell>;
}
