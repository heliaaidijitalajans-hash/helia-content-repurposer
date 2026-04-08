import type { Metadata } from "next";
import { DistanceSalesEn } from "@/components/legal/distance-sales-en";
import { DistanceSalesTr } from "@/components/legal/distance-sales-tr";
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
      ? "Mesafeli Satış Sözleşmesi | Helia AI"
      : "Distance Sales Agreement | Helia AI",
    description: isTr
      ? "Helia AI mesafeli satış sözleşmesi (SaaS abonelik)."
      : "Helia AI distance sales agreement (SaaS subscription).",
  };
}

export default async function DistanceSalesPage({ params }: Props) {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;

  return (
    <div className={saasDocumentPageClass}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <article className={saasDocumentPaperClass}>
          {isTr ? <DistanceSalesTr /> : <DistanceSalesEn />}
        </article>
      </div>
    </div>
  );
}
