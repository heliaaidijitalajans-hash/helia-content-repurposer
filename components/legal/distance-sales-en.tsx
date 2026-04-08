import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const addressClass = "mt-3 space-y-1 text-sm leading-relaxed text-gray-700";

/** English summary of the distance sales agreement (TR law context). */
export function DistanceSalesEn() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        DISTANCE SALES AGREEMENT (Digital Service – SaaS Subscription)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Last updated: 2026
      </p>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Parties</h2>
          <p className={pClass}>
            This Distance Sales Agreement (&quot;Agreement&quot;) is concluded
            electronically between:
          </p>
          <div className={addressClass}>
            <p>
              <span className="font-semibold text-gray-800">Provider:</span>{" "}
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
          <p className={pClass}>
            and the natural or legal person registered on the Helia AI platform
            (&quot;User&quot;).
          </p>
          <p className={pClass}>
            By paying through the platform, the User is deemed to have accepted
            this Agreement.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Subject</h2>
          <p className={pClass}>
            This Agreement defines the rights and obligations of the parties
            regarding subscription access to the Helia AI cloud software
            platform (SaaS) provided by the Provider.
          </p>
          <p className={pClass}>
            The service is not a physical product; it is software access
            delivered entirely in digital form.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Nature of the service</h2>
          <p className={`${pClass} font-medium text-gray-800`}>
            The Helia AI platform provides:
          </p>
          <ul className={ulClass}>
            <li>AI-assisted content generation</li>
            <li>Transformation of text, video, and audio content</li>
            <li>Creation of viral-style content (threads, carousels, hooks, etc.)</li>
            <li>Usage limits according to the subscription plan</li>
          </ul>
          <p className={pClass}>
            The service is provided online in real time and does not involve
            physical delivery.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Formation</h2>
          <p className={pClass}>
            The Agreement is deemed formed when the User completes payment and
            gives electronic consent.
          </p>
          <p className={pClass}>
            The User confirms having read and understood the terms.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Fees and payment</h2>
          <ul className={ulClass}>
            <li>Fees may be stated in US Dollars (USD).</li>
            <li>Payment is collected via electronic methods offered on the platform.</li>
            <li>Subscriptions renew automatically.</li>
            <li>
              Unless the User cancels, the fee is charged at the end of the
              subscription period.
            </li>
            <li>
              The User is responsible for bank charges, taxes, and currency
              differences.
            </li>
            <li>The Provider reserves the right to change prices.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Term and renewal</h2>
          <ul className={ulClass}>
            <li>Subscriptions may be monthly or yearly.</li>
            <li>They renew automatically at the end of the term.</li>
            <li>The User may cancel via the account before the renewal date.</li>
            <li>Cancellation takes effect at the end of the current billing period.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Right of withdrawal</h2>
          <p className={pClass}>
            Under Turkish consumer law (Law No. 6502 and the Distance Contracts
            Regulation):
          </p>
          <ul className={ulClass}>
            <li>
              There is no right of withdrawal for digital content and software
              services where performance begins immediately online.
            </li>
            <li>
              The User acknowledges that the service is activated immediately
              after payment and therefore waives the right of withdrawal.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Cancellation and refunds</h2>
          <ul className={ulClass}>
            <li>No refund of fees after the service has been activated.</li>
            <li>
              Refunds may be decided after review in case of technical failure
              or system error.
            </li>
            <li>
              Unjustified chargebacks may result in suspension or permanent
              closure of the account.
            </li>
            <li>
              Service may be terminated in case of fraud, abuse, or breach of
              contract.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>9. User obligations</h2>
          <p className={pClass}>The User must:</p>
          <ul className={ulClass}>
            <li>Provide accurate account information</li>
            <li>Maintain account security</li>
            <li>Use the platform lawfully</li>
            <li>Not infringe copyright or third-party rights</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Limitation of liability</h2>
          <ul className={ulClass}>
            <li>Accuracy of AI-generated content is not guaranteed.</li>
            <li>Legal liability for use of content rests with the User.</li>
            <li>
              The Provider’s total liability is limited to fees paid for the
              relevant subscription period.
            </li>
            <li>
              No liability for indirect damages, data loss, lost profits, or
              business interruption.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>11. Force majeure</h2>
          <p className={pClass}>
            Neither party is liable for events beyond reasonable control, such
            as natural disasters, war, infrastructure failure, or internet
            outages.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>12. Disputes</h2>
          <p className={pClass}>
            This Agreement is governed by the laws of the Republic of Turkey.
          </p>
          <p className={pClass}>
            Istanbul courts and enforcement offices have jurisdiction.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>13. Contact</h2>
          <p className={pClass}>
            For questions, please reach us via our{" "}
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
