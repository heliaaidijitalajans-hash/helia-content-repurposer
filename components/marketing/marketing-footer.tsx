import Link from "next/link";
import { getMarketingFooterCopy } from "@/lib/marketing/marketing-footer-copy";
import { PaymentLogosStrip } from "@/components/marketing/payment-logos-strip";

const linkClass =
  "block text-sm text-blue-200/70 transition hover:text-sky-300";
const colHeading =
  "text-xs font-semibold uppercase tracking-[0.12em] text-blue-300/55";

export async function MarketingFooter() {
  const { locale, copy: t } = await getMarketingFooterCopy();
  const lp = `/${locale}`;

  return (
    <footer className="w-full bg-gradient-to-b from-slate-900 via-[#0c1d33] to-[#0a1628] text-blue-100/90">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="lg:pr-4">
            <p className="text-lg font-semibold tracking-tight text-white">
              {t.brandTitle}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-blue-200/65">
              {t.brandDescription}
            </p>
          </div>

          <nav aria-label={t.colProduct}>
            <p className={colHeading}>{t.colProduct}</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href={`${lp}/features`} className={linkClass}>
                  {t.linkFeatures}
                </Link>
              </li>
              <li>
                <Link href="/generate" className={linkClass}>
                  {t.linkGenerate}
                </Link>
              </li>
              <li>
                <Link href="/history" className={linkClass}>
                  {t.linkHistory}
                </Link>
              </li>
              <li>
                <Link href="/account" className={linkClass}>
                  {t.linkAccount}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t.colSupport}>
            <p className={colHeading}>{t.colSupport}</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href={`${lp}/support`} className={linkClass}>
                  {t.linkSupport}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/support#sss`} className={linkClass}>
                  {t.linkFaq}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/about`} className={linkClass}>
                  {t.linkAbout}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t.colLegal}>
            <p className={colHeading}>{t.colLegal}</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href={`${lp}/terms`} className={linkClass}>
                  {t.linkTerms}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/distance-sales`} className={linkClass}>
                  {t.linkDistanceSales}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/pre-information`} className={linkClass}>
                  {t.linkPreInformation}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/refund-policy`} className={linkClass}>
                  {t.linkRefundPolicy}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/privacy-policy`} className={linkClass}>
                  {t.linkPrivacy}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/cookie-policy`} className={linkClass}>
                  {t.linkCookies}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/kvkk`} className={linkClass}>
                  {t.linkKvkk}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <div className="mx-auto max-w-3xl rounded-xl border border-blue-400/20 bg-blue-950/50 px-6 py-7 shadow-lg shadow-blue-950/40 sm:px-8 sm:py-8">
            <h3 className="text-center text-sm font-semibold tracking-tight text-white">
              {t.paymentsSectionTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-center text-xs leading-relaxed text-blue-200/70 sm:text-sm">
              {t.paymentsSectionSubtitle}
            </p>
            <PaymentLogosStrip ariaLabel={t.paymentsLogosAriaLabel} />
          </div>
          <p className="mt-10 text-center text-xs text-blue-300/50">
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
