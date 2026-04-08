import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Link as I18nLink } from "@/i18n/navigation";

const linkClass =
  "block text-sm text-gray-400 transition hover:text-blue-400";
const colHeading =
  "text-xs font-semibold uppercase tracking-[0.12em] text-gray-500";

export async function MarketingFooter() {
  const t = await getTranslations("marketingFooter");

  return (
    <footer className="w-full bg-[#0b1220] text-gray-300">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="lg:pr-4">
            <p className="text-lg font-semibold tracking-tight text-white">
              {t("brandTitle")}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              {t("brandDescription")}
            </p>
          </div>

          <nav aria-label={t("colProduct")}>
            <p className={colHeading}>{t("colProduct")}</p>
            <ul className="mt-5 space-y-3">
              <li>
                <I18nLink href="/features" className={linkClass}>
                  {t("linkFeatures")}
                </I18nLink>
              </li>
              <li>
                <Link href="/generate" className={linkClass}>
                  {t("linkGenerate")}
                </Link>
              </li>
              <li>
                <Link href="/history" className={linkClass}>
                  {t("linkHistory")}
                </Link>
              </li>
              <li>
                <Link href="/account" className={linkClass}>
                  {t("linkAccount")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t("colSupport")}>
            <p className={colHeading}>{t("colSupport")}</p>
            <ul className="mt-5 space-y-3">
              <li>
                <I18nLink href="/support" className={linkClass}>
                  {t("linkSupport")}
                </I18nLink>
              </li>
              <li>
                <I18nLink href="/support#sss" className={linkClass}>
                  {t("linkFaq")}
                </I18nLink>
              </li>
              <li>
                <I18nLink href="/about" className={linkClass}>
                  {t("linkAbout")}
                </I18nLink>
              </li>
            </ul>
          </nav>

          <nav aria-label={t("colLegal")}>
            <p className={colHeading}>{t("colLegal")}</p>
            <ul className="mt-5 space-y-3">
              <li>
                <I18nLink href="/terms" className={linkClass}>
                  {t("linkTerms")}
                </I18nLink>
              </li>
              <li>
                <I18nLink href="/privacy" className={linkClass}>
                  {t("linkPrivacy")}
                </I18nLink>
              </li>
              <li>
                <I18nLink href="/cookies" className={linkClass}>
                  {t("linkCookies")}
                </I18nLink>
              </li>
              <li>
                <I18nLink href="/kvkk" className={linkClass}>
                  {t("linkKvkk")}
                </I18nLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <p className="text-center text-sm text-gray-400">
            {t("paymentsSecure")}
          </p>
          <p className="mt-2 text-center text-xs font-medium tracking-wide text-gray-500">
            {t("paymentBadges")}
          </p>
          <p className="mt-8 text-center text-xs text-gray-500">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
