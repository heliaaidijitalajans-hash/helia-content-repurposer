import type { Metadata } from "next";
import { RefundPolicyEn } from "@/components/legal/refund-policy-en";
import { RefundPolicyTr } from "@/components/legal/refund-policy-tr";
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
      ? "İptal & İade Politikası | Helia AI"
      : "Cancellation & refund policy | Helia AI",
    description: isTr
      ? "Helia AI iptal ve iade politikası (SaaS abonelik)."
      : "Helia AI cancellation and refund policy (SaaS subscription).",
  };
}

export default async function RefundPolicyPage({ params }: Props) {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;

  return (
    <div className={saasDocumentPageClass}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <article className={saasDocumentPaperClass}>
          {isTr ? <RefundPolicyTr /> : <RefundPolicyEn />}
        </article>
      </div>
    </div>
  );
}
