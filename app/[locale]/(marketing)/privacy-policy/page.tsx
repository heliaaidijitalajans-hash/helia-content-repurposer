import type { Metadata } from "next";
import { PrivacyPolicyEn } from "@/components/legal/privacy-policy-en";
import { PrivacyPolicyTr } from "@/components/legal/privacy-policy-tr";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;
  return {
    title: isTr
      ? "Gizlilik Politikası | Helia AI"
      : "Privacy policy | Helia AI",
    description: isTr
      ? "Helia AI gizlilik politikası ve kişisel verilerin işlenmesi."
      : "Helia AI privacy policy and personal data processing.",
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;

  return (
    <div className="notranslate bg-white py-16 text-gray-900 sm:py-20">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        {isTr ? <PrivacyPolicyTr /> : <PrivacyPolicyEn />}
      </div>
    </div>
  );
}
