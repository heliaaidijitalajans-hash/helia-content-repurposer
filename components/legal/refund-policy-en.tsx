import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";

/** English summary of cancellation & refund policy (TR law context). */
export function RefundPolicyEn() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        CANCELLATION &amp; REFUND POLICY (Digital Service – SaaS Subscription)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Last updated: 2026
      </p>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. General information</h2>
          <p className={pClass}>
            Helia AI is a cloud software service (SaaS) delivered over the
            internet.
          </p>
          <p className={pClass}>
            The service is not a physical product and is provided instantly in
            digital form.
          </p>
          <p className={pClass}>
            Refund and cancellation terms therefore differ from those for
            physical goods.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Subscription cancellation</h2>
          <ul className={ulClass}>
            <li>The User may cancel the subscription at any time via the account.</li>
            <li>Cancellation takes effect at the end of the current billing period.</li>
            <li>Automatic renewal stops after cancellation.</li>
            <li>Fees already charged for the current period are non-refundable.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Right of withdrawal and refunds</h2>
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
              The User accepts that the service is activated as soon as payment
              is completed and that no right of withdrawal applies.
            </li>
          </ul>
          <p className={`${pClass} mt-4 font-medium text-gray-800`}>
            Therefore:
          </p>
          <ul className={ulClass}>
            <li>No refund of fees after the service has been activated.</li>
            <li>No refund for partial use.</li>
            <li>No refund for subscription periods already used.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Exceptional refunds</h2>
          <p className={pClass}>
            A refund may be decided after review in the following cases:
          </p>
          <ul className={ulClass}>
            <li>The service was never technically provided</li>
            <li>Access was impossible due to a system error</li>
            <li>Duplicate payment is identified</li>
          </ul>
          <p className={pClass}>
            Refund requests must be submitted in writing within 7 days of the
            payment date.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Chargebacks and abuse</h2>
          <ul className={ulClass}>
            <li>
              Unjustified chargebacks may result in suspension or permanent
              closure of the account.
            </li>
            <li>
              Service may be terminated immediately if fraud, abuse, or breach
              of contract is detected.
            </li>
            <li>No refund applies in these situations.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Refund process</h2>
          <ul className={ulClass}>
            <li>
              If a refund is approved, it is made via the same payment method
              used for the original transaction.
            </li>
            <li>Timing depends on the financial institution’s processing time.</li>
            <li>Bank fees and exchange differences are not included in the refund.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Contact</h2>
          <p className={pClass}>For refund and cancellation requests:</p>
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
