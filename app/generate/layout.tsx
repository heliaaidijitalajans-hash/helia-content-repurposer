import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/standalone/require-session";

export const metadata: Metadata = {
  title: "İçerik oluştur | Helia AI",
  description: "Metin ve videodan thread, carousel ve hook üretin",
};

export default async function GenerateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("/generate");
  return <AppShell>{children}</AppShell>;
}
