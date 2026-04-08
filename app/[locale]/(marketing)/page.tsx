import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const glassCard =
  "rounded-xl border border-white/15 bg-white/[0.07] shadow-lg shadow-black/25 backdrop-blur-xl";

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
    <div className="notranslate relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0a1628] via-slate-950 to-[#020617] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(99,102,241,0.35),transparent)] opacity-[0.35]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(59,130,246,0.12),transparent)] opacity-[0.35]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_0%_80%,rgba(79,70,229,0.15),transparent)] opacity-[0.35]"
        aria-hidden
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-12">
        {/* Hero */}
        <div className="grid items-center gap-12 lg:grid-cols-[1fr,minmax(0,26rem)] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">
              {t("heroEyebrow")}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
              {t("heroHeadline")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300/95 sm:text-xl">
              {t("heroSub")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-slate-900 shadow-lg shadow-black/25 transition hover:bg-sky-50 hover:shadow-xl"
              >
                {t("ctaFree")}
              </Link>
              <Link
                href={{ pathname: "/auth", query: { next: authNextDashboard } }}
                className={`inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10`}
              >
                {t("ctaDemo")}
              </Link>
            </div>
          </div>

          {/* Mockup */}
          <div
            className={`${glassCard} p-5 sm:p-6 ring-1 ring-white/10 transition duration-300 hover:ring-white/20 hover:shadow-xl`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-400">
                {t("mockTitle")}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                {t("mockBadge")}
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-black/25 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-400/90">
                  {t("mockLblThread")}
                </p>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-200/95">
                  {t("mockThread")}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-300/90">
                  {t("mockLblCarousel")}
                </p>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-200/95">
                  {t("mockSlide")}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-300/90">
                  {t("mockLblHooks")}
                </p>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-200/95">
                  {t("mockHooks")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24 sm:mt-28">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/85">
            {t("featuresEyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t("featuresTitle")}
          </h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            {features.map((item) => (
              <li
                key={item.title}
                className={`${glassCard} group p-6 transition duration-300 hover:border-white/25 hover:bg-white/[0.1] hover:shadow-xl`}
              >
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 transition group-hover:text-slate-300">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-24 sm:mt-28">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/85">
            {t("howEyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t("howTitle")}
          </h2>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={`relative ${glassCard} p-6 text-center transition duration-300 hover:border-white/25 hover:shadow-xl`}
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/90 to-indigo-600 text-sm font-bold text-white shadow-lg">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-24 sm:mt-28">
          <div
            className={`mx-auto max-w-2xl ${glassCard} px-8 py-12 text-center ring-1 ring-white/10 sm:px-10 sm:py-14`}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t("ctaBottomTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
              {t("ctaBottomSub")}
            </p>
            <Link
              href="/auth"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-sky-50 hover:shadow-xl"
            >
              {t("ctaBottomButton")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-slate-500">
        {t("footer")}
      </footer>
    </div>
  );
}
