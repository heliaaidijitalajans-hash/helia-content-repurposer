import type { Metadata } from "next";
import { KvkkNoticeEn } from "@/components/legal/kvkk-notice-en";
import { KvkkNoticeTr } from "@/components/legal/kvkk-notice-tr";
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
      ? "KVKK Aydınlatma Metni | Helia AI"
      : "KVKK privacy notice | Helia AI",
    description: isTr
      ? "Helia AI KVKK aydınlatma metni ve kişisel verilerin işlenmesi."
      : "Helia AI KVKK (Turkish DPA law) privacy notice.",
  };
}

export default async function KvkkPage({ params }: Props) {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;

  return (
    <div className={saasDocumentPageClass}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <article className={saasDocumentPaperClass}>
          {isTr ? <KvkkNoticeTr /> : <KvkkNoticeEn />}
        </article>
      </div>
    </div>
  );
}
