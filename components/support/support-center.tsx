import type { SupportPageCopy } from "@/lib/support/load-copy";
import { lightCardClass } from "@/lib/ui/saas-card";

const SUPPORT_EMAIL = "helia.destek@gmail.com";
const WHATSAPP_HREF = "https://wa.me/905011102818";

const cardClass = `${lightCardClass} shadow-sm`;

const btnPrimary =
  "inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700";

export function SupportCenter({ copy }: { copy: SupportPageCopy }) {
  const faqs = [
    { q: copy.faq1Q, a: copy.faq1A },
    { q: copy.faq2Q, a: copy.faq2A },
    { q: copy.faq3Q, a: copy.faq3A },
  ] as const;
  return (
    <main className="mx-auto max-w-[900px] px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {copy.subtitle}
        </p>
      </header>

      <section
        className="mt-12 grid gap-5 sm:grid-cols-2"
        aria-label={copy.contactSectionLabel}
      >
        <div className={`flex h-full flex-col ${cardClass}`}>
          <h2 className="text-base font-semibold text-blue-600">
            {copy.emailCardTitle}
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
            {copy.emailCardDesc}
          </p>
          <p className="mt-4 font-mono text-sm font-medium text-gray-900">
            {SUPPORT_EMAIL}
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={`${btnPrimary} mt-6`}>
            {copy.emailCta}
          </a>
        </div>

        <div className={`flex h-full flex-col ${cardClass}`}>
          <h2 className="text-base font-semibold text-blue-600">
            {copy.whatsappCardTitle}
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
            {copy.whatsappCardDesc}
          </p>
          <p className="mt-4 text-sm font-medium text-gray-900">
            {copy.whatsappPhoneDisplay}
          </p>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnPrimary} mt-6`}
          >
            {copy.whatsappCta}
          </a>
        </div>
      </section>

      <section
        id="sss"
        className="mt-16 scroll-mt-24 border-t border-blue-200/50 pt-16 sm:mt-20 sm:pt-20"
      >
        <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900">
          {copy.faqTitle}
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className={`group ${cardClass} [&_summary::-webkit-details-marker]:hidden`}
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-gray-900">
                <span className="flex items-start justify-between gap-3">
                  <span>{item.q}</span>
                  <span
                    className="shrink-0 text-blue-600 transition group-open:rotate-180"
                    aria-hidden
                  >
                    ▼
                  </span>
                </span>
              </summary>
              <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
