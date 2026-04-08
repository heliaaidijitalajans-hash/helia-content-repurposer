import type { Metadata } from "next";
import { PreInformationEn } from "@/components/legal/pre-information-en";
import { PreInformationTr } from "@/components/legal/pre-information-tr";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;
  return {
    title: isTr
      ? "Ön Bilgilendirme Formu | Helia AI"
      : "Pre-contract information | Helia AI",
    description: isTr
      ? "Helia AI ön bilgilendirme formu (SaaS abonelik)."
      : "Helia AI pre-contract information (SaaS subscription).",
  };
}

export default async function PreInformationPage({ params }: Props) {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;

  return (
    <div className="notranslate bg-white py-16 text-gray-900 sm:py-20">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        {isTr ? <PreInformationTr /> : <PreInformationEn />}
      </div>
    </div>
  );
}
