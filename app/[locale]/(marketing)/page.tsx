import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { darkSectionCardClass, lightCardClass } from "@/lib/ui/saas-card";

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

  const authNextDashboard = `/${locale}/dashboard`;

  return (
    <div className="notranslate overflow-x-hidden bg-white text-gray-900">
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white">
        <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr,minmax(0,26rem)] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
                {t("heroEyebrow")}
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
                {t("heroHeadline")}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-200/95 sm:text-xl">
                {t("heroSub")}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/auth"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-100"
                >
                  {t("ctaFree")}
                </Link>
                <Link
                  href={{
                    pathname: "/auth",
                    query: { next: authNextDashboard },
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  {t("ctaDemo")}
                </Link>
              </div>
            </div>

            <div className={darkSectionCardClass}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-300">
                  {t("mockTitle")}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                  {t("mockBadge")}
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-black/25 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
                    {t("mockLblThread")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-100">
                    {t("mockThread")}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/25 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                    {t("mockLblCarousel")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-100">
                    {t("mockSlide")}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/25 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                    {t("mockLblHooks")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-100">
                    {t("mockHooks")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
        <section>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
            {t("featuresEyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {t("featuresTitle")}
          </h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            {features.map((item) => (
              <li key={item.title} className={`group ${lightCardClass}`}>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 transition group-hover:text-gray-700">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24 sm:mt-28">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
            {t("howEyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {t("howTitle")}
          </h2>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={`relative ${lightCardClass} text-center`}
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-bold text-white shadow-md">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-24 sm:mt-28">
          <div className={`mx-auto max-w-2xl text-center ${lightCardClass}`}>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              {t("ctaBottomTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base">
              {t("ctaBottomSub")}
            </p>
            <Link
              href="/auth"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              {t("ctaBottomButton")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500">
        {t("footer")}
      </footer>
    </div>
  );
}
