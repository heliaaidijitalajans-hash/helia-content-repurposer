import { getTranslations } from "next-intl/server";
import { lightCardClass } from "@/lib/ui/saas-card";

export default async function MarketingSupportPage() {
  const t = await getTranslations("marketingPages");
  return (
    <div className="notranslate min-h-[50vh] bg-white px-4 py-16 text-gray-900 sm:px-6">
      <div className={`mx-auto max-w-3xl ${lightCardClass}`}>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          {t("supportTitle")}
        </h1>
        <p className="mt-3 text-sm text-gray-600">{t("supportSub")}</p>
      </div>
    </div>
  );
}
