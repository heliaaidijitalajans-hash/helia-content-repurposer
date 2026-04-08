import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { requireSession } from "@/lib/standalone/require-session";

export const metadata: Metadata = {
  title: "Account | Helia AI",
  description: "Manage your Helia AI account, plan, and usage",
};

export default async function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("/account");
  return <Layout>{children}</Layout>;
}
