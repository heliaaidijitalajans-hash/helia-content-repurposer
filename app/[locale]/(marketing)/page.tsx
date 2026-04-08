import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { lightCardClass } from "@/lib/ui/saas-card";

const btnPrimary =
  "inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700";
const btnSecondary =
  "inline-flex h-12 items-center justify-center rounded-lg border border-blue-200/80 bg-white/60 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-blue-900/5 transition hover:bg-blue-50/90";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");

  const features = [
    {
      title: t("feature1Title"),
      body: t("feature1Body"),
    },
    {
      title: t("feature2Title"),
      body: t("feature2Body"),
    },
    {
      title: t("feature3Title"),
      body: t("feature3Body"),
    },
  ];

  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];

  const authNextDashboard = "/dashboard";

  return (
    <div className="notranslate overflow-x-hidden bg-transparent text-slate-900">
      <section className="border-b border-blue-200/40 bg-transparent">
        <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr,minmax(0,26rem)] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t("heroEyebrow")}
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
                {t("heroHeadlineBefore")}
                <span className="text-blue-600">{t("heroHeadlineHighlight")}</span>
                {t("heroHeadlineAfter")}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                {t("heroSub")}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/auth" className={btnPrimary}>
                  {t("ctaFree")}
                </Link>
                <Link
                  href={{
                    pathname: "/auth",
                    query: { next: authNextDashboard },
                  }}
                  className={btnSecondary}
                >
                  {t("ctaDemo")}
                </Link>
              </div>
            </div>

            <div className={lightCardClass}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">
                  {t("mockTitle")}
                </span>
                <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-800 ring-1 ring-blue-200/60">
                  {t("mockBadge")}
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-blue-200/70 bg-blue-50/50 p-3.5 shadow-sm shadow-blue-900/5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {t("mockLblThread")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-900">
                    {t("mockThread")}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200/70 bg-blue-50/50 p-3.5 shadow-sm shadow-blue-900/5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {t("mockLblCarousel")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-900">
                    {t("mockSlide")}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200/70 bg-blue-50/50 p-3.5 shadow-sm shadow-blue-900/5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {t("mockLblHooks")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-900">
                    {t("mockHooks")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl bg-transparent px-5 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
        <section>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t("featuresEyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t("featuresTitle")}
          </h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            {features.map((item) => (
              <li key={item.title} className={`group ${lightCardClass}`}>
                <h3 className="text-base font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 transition group-hover:text-slate-700">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24 sm:mt-28">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t("howEyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t("howTitle")}
          </h2>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={`relative ${lightCardClass} text-center`}
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-600 bg-white/95 text-sm font-bold text-blue-600 shadow-sm shadow-blue-900/10">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-24 sm:mt-28">
          <div className={`mx-auto max-w-2xl text-center ${lightCardClass}`}>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("ctaBottomTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
              {t("ctaBottomSub")}
            </p>
            <Link href="/auth" className={`mt-8 ${btnPrimary} px-8`}>
              {t("ctaBottomButton")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
