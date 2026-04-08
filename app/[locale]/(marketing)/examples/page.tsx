import { getTranslations } from "next-intl/server";
import { lightCardClass } from "@/lib/ui/saas-card";

export default async function ExamplesPage() {
  const t = await getTranslations("marketingPages");
  return (
    <div className="notranslate min-h-[50vh] bg-transparent px-4 py-16 text-slate-900 sm:px-6">
      <div className={`mx-auto max-w-3xl ${lightCardClass}`}>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("examplesTitle")}
        </h1>
        <p className="mt-3 text-sm text-slate-600">{t("examplesSub")}</p>
      </div>
    </div>
  );
}
