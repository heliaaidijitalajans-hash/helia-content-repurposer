import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { requireSession } from "@/lib/standalone/require-session";

export const metadata: Metadata = {
  title: "Ödeme | Helia AI",
  description: "Helia AI plan özeti ve demo ödeme",
};

export default async function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("/checkout");
  return <Layout>{children}</Layout>;
}
