import type { Metadata } from "next";
import { TermsOfServiceEn } from "@/components/legal/terms-of-service-en";
import { TermsOfServiceTr } from "@/components/legal/terms-of-service-tr";
import { routing } from "@/i18n/routing";
import {
  saasDocumentPageClass,
  saasDocumentPaperClass,
} from "@/lib/ui/saas-card";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;
  return {
    title: isTr
      ? "Kullanım Şartları | Helia AI"
      : "Terms of Service | Helia AI",
    description: isTr
      ? "Helia AI platformu kullanım şartları."
      : "Helia AI platform terms of service.",
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;

  return (
    <div className={saasDocumentPageClass}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <article className={saasDocumentPaperClass}>
          {isTr ? <TermsOfServiceTr /> : <TermsOfServiceEn />}
        </article>
      </div>
    </div>
  );
}
