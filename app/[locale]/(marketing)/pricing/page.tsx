import type { Metadata } from "next";
import { MarketingPricingContent } from "@/components/marketing/marketing-pricing";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === routing.defaultLocale;
  return {
    title: isTr ? "Fiyatlandırma | Helia AI" : "Pricing | Helia AI",
    description: isTr
      ? "Helia AI planları: Ücretsiz, Aylık, Pro ve Yıllık."
      : "Helia AI plans: Free, Monthly, Pro, and Yearly.",
  };
}

export default async function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-white text-gray-900">
      <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6 sm:py-20">
        <MarketingPricingContent />
      </div>
    </div>
  );
}
