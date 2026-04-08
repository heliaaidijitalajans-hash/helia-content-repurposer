import { getTranslations } from "next-intl/server";

export default async function ExamplesPage() {
  const t = await getTranslations("marketingPages");
  return (
    <div className="notranslate min-h-[50vh] bg-zinc-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {t("examplesTitle")}
        </h1>
        <p className="mt-3 text-sm text-zinc-500">{t("examplesSub")}</p>
      </div>
    </div>
  );
}
