import Link from "next/link";
import { getMarketingFooterCopy } from "@/lib/marketing/marketing-footer-copy";
import { PaymentLogosStrip } from "@/components/marketing/payment-logos-strip";

const linkClass =
  "block text-sm text-gray-400 transition hover:text-blue-400";
const colHeading =
  "text-xs font-semibold uppercase tracking-[0.12em] text-gray-500";

export async function MarketingFooter() {
  const { locale, copy: t } = await getMarketingFooterCopy();
  const lp = `/${locale}`;

  return (
    <footer className="w-full bg-[#0b1220] text-gray-300">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="lg:pr-4">
            <p className="text-lg font-semibold tracking-tight text-white">
              {t.brandTitle}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
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
                <Link href={`${lp}/privacy`} className={linkClass}>
                  {t.linkPrivacy}
                </Link>
              </li>
              <li>
                <Link href={`${lp}/cookies`} className={linkClass}>
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
          <div className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#131c2e] px-6 py-7 sm:px-8 sm:py-8">
            <h3 className="text-center text-sm font-semibold tracking-tight text-white">
              {t.paymentsSectionTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-center text-xs leading-relaxed text-gray-400 sm:text-sm">
              {t.paymentsSectionSubtitle}
            </p>
            <PaymentLogosStrip ariaLabel={t.paymentsLogosAriaLabel} />
          </div>
          <p className="mt-10 text-center text-xs text-gray-500">
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
