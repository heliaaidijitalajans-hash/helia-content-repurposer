import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("legalPages");
  return (
    <div className="notranslate bg-white py-16 text-gray-900">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("privacyTitle")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {t("privacyBody")}
        </p>
      </div>
    </div>
  );
}
