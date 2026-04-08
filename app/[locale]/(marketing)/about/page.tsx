import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { lightCardClass } from "@/lib/ui/saas-card";

const whatKeys = ["what1", "what2", "what3", "what4"] as const;

const whyKeys = [
  { title: "whyFastTitle" as const, text: "whyFastText" as const },
  { title: "whyEasyTitle" as const, text: "whyEasyText" as const },
  { title: "whyEffectiveTitle" as const, text: "whyEffectiveText" as const },
];

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");

  return (
    <div className="notranslate min-h-screen bg-transparent text-slate-900">
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl sm:leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {t("heroSub")}
          </p>
        </header>

        <section className="mt-16 border-t border-blue-200/50 pt-16 text-center sm:mt-20 sm:pt-20">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {t("missionTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            {t("missionText")}
          </p>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-16 sm:mt-20 sm:pt-20">
          <h2 className="text-center text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
            {t("whatTitle")}
          </h2>
          <ul className="mx-auto mt-8 max-w-xl space-y-4 text-left text-base text-gray-600 sm:text-[15px]">
            {whatKeys.map((key) => (
              <li key={key} className="flex gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"
                  aria-hidden
                />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-16 sm:mt-20 sm:pt-20">
          <h2 className="text-center text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
            {t("whyTitle")}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {whyKeys.map(({ title, text }) => (
              <div key={title} className={lightCardClass}>
                <h3 className="text-sm font-semibold text-blue-600">
                  {t(title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {t(text)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-blue-200/60 bg-blue-50/50 px-6 py-12 text-center shadow-md shadow-blue-900/10 ring-1 ring-blue-100/50 sm:mt-20 sm:py-14">
          <p className="text-base font-medium text-slate-900 sm:text-lg">
            {t("ctaText")}
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t("ctaButton")}
          </Link>
        </section>
      </main>
    </div>
  );
}
