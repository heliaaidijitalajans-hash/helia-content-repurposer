import type { Metadata } from "next";
import { CookiePolicyEn } from "@/components/legal/cookie-policy-en";
import { CookiePolicyTr } from "@/components/legal/cookie-policy-tr";
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
      ? "Çerez Politikası | Helia AI"
      : "Cookie policy | Helia AI",
    description: isTr
      ? "Helia AI çerez politikası ve çerez türleri."
      : "Helia AI cookie policy and cookie types.",
  };
}

export default async function CookiePolicyPage({ params }: Props) {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;

  return (
    <div className={saasDocumentPageClass}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <article className={saasDocumentPaperClass}>
          {isTr ? <CookiePolicyTr /> : <CookiePolicyEn />}
        </article>
      </div>
    </div>
  );
}
