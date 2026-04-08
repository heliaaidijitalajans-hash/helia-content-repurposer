import { getTranslations } from "next-intl/server";
import { saasCardClass } from "@/lib/ui/saas-card";

export default async function ExamplesPage() {
  const t = await getTranslations("marketingPages");
  return (
    <div className="notranslate min-h-[50vh] px-4 py-16 text-slate-100 sm:px-6">
      <div className={`mx-auto max-w-3xl ${saasCardClass}`}>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {t("examplesTitle")}
        </h1>
        <p className="mt-3 text-sm text-slate-300">{t("examplesSub")}</p>
      </div>
    </div>
  );
}
