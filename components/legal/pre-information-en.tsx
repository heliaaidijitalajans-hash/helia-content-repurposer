import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const addressClass = "mt-3 space-y-1 text-sm leading-relaxed text-gray-700";

/** English summary of the pre-contract information form (TR law context). */
export function PreInformationEn() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        PRE-CONTRACT INFORMATION FORM (Digital Service – SaaS Subscription)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Last updated: 2026
      </p>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Service provider details</h2>
          <div className={addressClass}>
            <p>
              <span className="font-semibold text-gray-800">Legal name:</span>{" "}
              Aysel Nur Akıncı
            </p>
            <p>
              <span className="font-semibold text-gray-800">Tax ID:</span>{" "}
              1160825918
            </p>
            <p>
              <span className="font-semibold text-gray-800">Address:</span>{" "}
              Istanbul/Silivri, Mimar Sinan Mah., Fatih Sultan Mehmet Cad.
              No:38-R, Apt. 14
            </p>
            <p>
              <span className="font-semibold text-gray-800">Email:</span>{" "}
              <a
                href="mailto:helia.destek@gmail.com"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                helia.destek@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Main features of the service</h2>
          <p className={pClass}>
            Helia AI is a cloud software service (SaaS) delivered over the
            internet. The platform provides:
          </p>
          <ul className={ulClass}>
            <li>AI-assisted content generation</li>
            <li>Transformation of text, video, and audio content</li>
            <li>Creation of viral-style content (threads, carousels, hooks, etc.)</li>
            <li>Usage limits tied to the subscription plan</li>
          </ul>
          <p className={pClass}>
            The service is not a physical product and is provided entirely in
            digital form.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Pricing and payment</h2>
          <ul className={ulClass}>
            <li>Fees may be stated in US Dollars (USD).</li>
            <li>Payment is collected via electronic methods offered on the platform.</li>
            <li>Subscriptions renew automatically.</li>
            <li>
              Unless the User cancels, the fee is charged at the end of the
              subscription period.
            </li>
            <li>Bank charges and exchange rate differences are borne by the User.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Subscription term and cancellation</h2>
          <ul className={ulClass}>
            <li>Subscriptions may be monthly or yearly.</li>
            <li>The User may cancel via the account before the renewal date.</li>
            <li>Cancellation takes effect at the end of the current billing period.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Right of withdrawal</h2>
          <p className={pClass}>
            Under Turkish consumer law (Law No. 6502 and related regulations):
          </p>
          <ul className={ulClass}>
            <li>
              There is no right of withdrawal for digital content and software
              services where performance begins immediately online.
            </li>
            <li>
              The User accepts that the service is activated as soon as payment
              is completed and that no right of withdrawal therefore applies.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Refund policy</h2>
          <ul className={ulClass}>
            <li>No refund of fees after the service has been activated.</li>
            <li>
              Refunds may be decided after review in case of technical failure
              or system error.
            </li>
            <li>
              Unjustified chargebacks may result in suspension or closure of the
              account.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Use and liability</h2>
          <ul className={ulClass}>
            <li>
              Legal liability arising from use of AI-generated content rests with
              the User.
            </li>
            <li>Uninterrupted or error-free service is not guaranteed.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Complaints and contact</h2>
          <p className={pClass}>For all questions and requests:</p>
          <p className={pClass}>
            <span className="font-semibold text-gray-800">Email:</span>{" "}
            <a
              href="mailto:helia.destek@gmail.com"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              helia.destek@gmail.com
            </a>
          </p>
          <p className={pClass}>
            You can also reach us via our{" "}
            <Link
              href="/support"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              support page
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
