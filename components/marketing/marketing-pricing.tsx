import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PricingCheckoutLink } from "@/components/marketing/pricing-checkout-link";
import { lightCardClass } from "@/lib/ui/saas-card";

const primaryCtaClass =
  "mt-auto flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition duration-200 hover:scale-[1.02] hover:shadow-lg hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]";

const outlineCtaClass =
  "mt-auto flex w-full items-center justify-center rounded-xl border-2 border-blue-200/80 bg-white/95 px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm shadow-blue-900/5 transition duration-200 hover:scale-[1.02] hover:border-blue-300 hover:bg-blue-50/90 hover:shadow-md active:scale-[0.98]";

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
      <span className="mt-0.5 shrink-0 text-emerald-500" aria-hidden>
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function PricingCreditsEquivalent({
  videoCredits,
  textCredits,
  label,
  videoLabel,
  textLabel,
  hint,
}: {
  videoCredits: number;
  textCredits: number;
  label: string;
  videoLabel: string;
  textLabel: string;
  hint: string;
}) {
  return (
    <div
      className="mt-3 border-t border-blue-200/60 pt-3 text-sm text-slate-500"
      title={hint}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 leading-relaxed">
        <span aria-hidden>🎥 </span>
        <span className="font-semibold text-slate-700">{videoCredits}</span>
        {videoLabel}
      </p>
      <p className="mt-1 leading-relaxed">
        <span aria-hidden>📝 </span>
        <span className="font-semibold text-slate-700">{textCredits}</span>
        {textLabel}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{hint}</p>
    </div>
  );
}

export async function MarketingPricingContent() {
  const t = await getTranslations("marketingPages");

  return (
    <div className="notranslate">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
        {t("pricingPagePoweredBy")}
      </p>

      <header className="mx-auto mt-6 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("pricingPageHeroTitle")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          {t("pricingPageHeroSub")}
        </p>
      </header>

      <div className="mx-auto mt-14 grid max-w-[1100px] grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
        {/* Free */}
        <article className={`flex h-full flex-col ${lightCardClass}`}>
          <h2 className="text-lg font-bold text-slate-900">
            {t("pricingPageFreeTitle")}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {t("pricingPageFreePrice")}
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            <CheckItem>{t("pricingPageFreeF1")}</CheckItem>
            <CheckItem>{t("pricingPageFreeF2")}</CheckItem>
            <CheckItem>{t("pricingPageFreeF3")}</CheckItem>
          </ul>
          <PricingCreditsEquivalent
            videoCredits={30}
            textCredits={3}
            label={t("pricingPageCreditsLabel")}
            videoLabel={t("pricingPageCreditsVideoLabel")}
            textLabel={t("pricingPageCreditsTextLabel")}
            hint={t("pricingPageCreditsHint")}
          />
          <PricingCheckoutLink
            href="/checkout?plan=free"
            className={`${outlineCtaClass} pt-6`}
          >
            {t("pricingPageFreeCta")}
          </PricingCheckoutLink>
        </article>

        {/* Monthly */}
        <article className={`flex h-full flex-col ${lightCardClass}`}>
          <h2 className="text-lg font-bold text-slate-900">
            {t("pricingPageMonthlyTitle")}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {t("pricingPageMonthlyPrice")}
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            <CheckItem>{t("pricingPageMonthlyF1")}</CheckItem>
            <CheckItem>{t("pricingPageMonthlyF2")}</CheckItem>
            <CheckItem>{t("pricingPageMonthlyF3")}</CheckItem>
          </ul>
          <PricingCreditsEquivalent
            videoCredits={200}
            textCredits={40}
            label={t("pricingPageCreditsLabel")}
            videoLabel={t("pricingPageCreditsVideoLabel")}
            textLabel={t("pricingPageCreditsTextLabel")}
            hint={t("pricingPageCreditsHint")}
          />
          <PricingCheckoutLink
            href="/checkout?plan=monthly"
            className={`${primaryCtaClass} pt-6`}
          >
            {t("pricingPageMonthlyCta")}
          </PricingCheckoutLink>
        </article>

        {/* Pro — highlighted */}
        <article className="relative flex h-full flex-col rounded-xl border-2 border-blue-500 bg-white/95 p-6 shadow-xl shadow-blue-900/15 ring-4 ring-blue-500/15 backdrop-blur-sm transition-shadow hover:shadow-lg xl:z-10 xl:scale-[1.04] xl:shadow-xl">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-md">
            {t("pricingPageProBadge")}
          </span>
          <h2 className="mt-2 text-lg font-bold text-slate-900">
            {t("pricingPageProTitle")}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {t("pricingPageProPrice")}
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            <CheckItem>{t("pricingPageProF1")}</CheckItem>
            <CheckItem>{t("pricingPageProF2")}</CheckItem>
            <CheckItem>{t("pricingPageProF3")}</CheckItem>
            <CheckItem>{t("pricingPageProF4")}</CheckItem>
          </ul>
          <PricingCreditsEquivalent
            videoCredits={300}
            textCredits={55}
            label={t("pricingPageCreditsLabel")}
            videoLabel={t("pricingPageCreditsVideoLabel")}
            textLabel={t("pricingPageCreditsTextLabel")}
            hint={t("pricingPageCreditsHint")}
          />
          <PricingCheckoutLink
            href="/checkout?plan=pro"
            className={`${primaryCtaClass} pt-6`}
          >
            {t("pricingPageProCta")}
          </PricingCheckoutLink>
        </article>

        {/* Yearly */}
        <article className="flex h-full flex-col rounded-xl border border-indigo-200/80 bg-gradient-to-b from-sky-50/60 via-white/90 to-indigo-50/30 p-6 shadow-md shadow-blue-900/10 ring-1 ring-indigo-100/70 transition-shadow hover:shadow-lg">
          <span className="w-fit rounded-full bg-indigo-100/90 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
            {t("pricingPageYearlyBadge")}
          </span>
          <h2 className="mt-3 text-lg font-bold text-slate-900">
            {t("pricingPageYearlyTitle")}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {t("pricingPageYearlyPrice")}
          </p>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            <CheckItem>{t("pricingPageYearlyF1")}</CheckItem>
            <CheckItem>{t("pricingPageYearlyF2")}</CheckItem>
            <CheckItem>{t("pricingPageYearlyF3")}</CheckItem>
            <CheckItem>{t("pricingPageYearlyF4")}</CheckItem>
          </ul>
          <PricingCreditsEquivalent
            videoCredits={3000}
            textCredits={550}
            label={t("pricingPageCreditsLabel")}
            videoLabel={t("pricingPageCreditsVideoLabel")}
            textLabel={t("pricingPageCreditsTextLabel")}
            hint={t("pricingPageCreditsHint")}
          />
          <PricingCheckoutLink
            href="/checkout?plan=yearly"
            className={`${primaryCtaClass} pt-6`}
          >
            {t("pricingPageYearlyCta")}
          </PricingCheckoutLink>
        </article>
      </div>

      <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-slate-600">
        {t("pricingPageNote")}
      </p>

      <section
        className="mx-auto mt-14 max-w-3xl border-t border-blue-200/50 pt-10"
        aria-label={t("pricingPageTrustSectionAria")}
      >
        <ul className="flex flex-col items-center gap-4 text-sm font-medium text-slate-700 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-3">
          <li className="flex items-center gap-2">
            <span className="text-emerald-500" aria-hidden>
              ✓
            </span>
            {t("pricingPageTrust1")}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-500" aria-hidden>
              ✓
            </span>
            {t("pricingPageTrust2")}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-500" aria-hidden>
              ✓
            </span>
            {t("pricingPageTrust3")}
          </li>
        </ul>
      </section>

      <nav
        className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-blue-200/50 pt-10 text-sm"
        aria-label={t("pricingPageLegalNavAria")}
      >
        <Link
          href="/distance-sales"
          className="text-slate-500 underline-offset-2 transition hover:text-blue-600 hover:underline"
        >
          {t("pricingPageLinkDistance")}
        </Link>
        <Link
          href="/privacy-policy"
          className="text-slate-500 underline-offset-2 transition hover:text-blue-600 hover:underline"
        >
          {t("pricingPageLinkPrivacy")}
        </Link>
        <Link
          href="/kvkk"
          className="text-slate-500 underline-offset-2 transition hover:text-blue-600 hover:underline"
        >
          {t("pricingPageLinkKvkk")}
        </Link>
        <Link
          href="/refund-policy"
          className="text-slate-500 underline-offset-2 transition hover:text-blue-600 hover:underline"
        >
          {t("pricingPageLinkRefund")}
        </Link>
      </nav>
    </div>
  );
}
