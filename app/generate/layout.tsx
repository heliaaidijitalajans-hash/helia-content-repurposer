import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { AppShell } from "@/components/AppShell";
import { getStandaloneLocale } from "@/lib/account/load-copy";
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
  const locale = await getStandaloneLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppShell>{children}</AppShell>
    </NextIntlClientProvider>
  );
}
