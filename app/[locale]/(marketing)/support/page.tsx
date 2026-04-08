import { getTranslations } from "next-intl/server";
import { lightCardClass } from "@/lib/ui/saas-card";
import { SupportContactForm } from "@/components/marketing/support-contact-form";

const SUPPORT_EMAIL = "helia.destek@gmail.com";
const WHATSAPP_HREF = "https://wa.me/905011102818";

const faqIds = [1, 2, 3, 4, 5] as const;

export default async function MarketingSupportPage() {
  const t = await getTranslations("supportPage");

  return (
    <div className="notranslate min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <section
          className="mt-12 grid gap-5 sm:grid-cols-2"
          aria-label={t("contactSectionLabel")}
        >
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className={`${lightCardClass} block transition hover:border-blue-200 hover:shadow-md`}
          >
            <h2 className="text-sm font-semibold text-blue-600">
              {t("emailCardTitle")}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{t("emailCardText")}</p>
            <p className="mt-4 text-sm font-medium text-gray-900 underline-offset-2 hover:underline">
              {SUPPORT_EMAIL}
            </p>
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={`${lightCardClass} block transition hover:border-blue-200 hover:shadow-md`}
          >
            <h2 className="text-sm font-semibold text-blue-600">
              {t("whatsappCardTitle")}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{t("whatsappCardText")}</p>
            <p className="mt-4 text-sm font-medium text-gray-900 underline-offset-2 hover:underline">
              {t("whatsappPhoneDisplay")}
            </p>
          </a>
        </section>

        <section className="mt-12" aria-label={t("formTitle")}>
          <SupportContactForm />
        </section>

        <section className="mt-16 border-t border-gray-100 pt-16 sm:mt-20 sm:pt-20">
          <h2 className="text-center text-xl font-semibold tracking-tight text-gray-900">
            {t("faqTitle")}
          </h2>
          <div className="mt-8 space-y-3">
            {faqIds.map((id) => (
              <details
                key={id}
                className={`group ${lightCardClass} [&_summary::-webkit-details-marker]:hidden`}
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-gray-900">
                  <span className="flex items-start justify-between gap-3">
                    <span>{t(`faq${id}Q`)}</span>
                    <span
                      className="shrink-0 text-blue-600 transition group-open:rotate-180"
                      aria-hidden
                    >
                      ▼
                    </span>
                  </span>
                </summary>
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">
                  {t(`faq${id}A`)}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
