import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";

/** English counterpart to the Turkish Terms of Service (same legal structure). */
export function TermsOfServiceEn() {
  return (
    <article>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        TERMS OF SERVICE
      </h1>

      <div className="mt-10 space-y-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Parties and acceptance</h2>
          <p className={pClass}>
            These Terms of Service (“Terms”) are entered into between Aysel Nur
            Akıncı (1160825918) (“Provider”) and any user accessing the Helia AI
            platform (“User”).
          </p>
          <p className={pClass}>
            By accessing the platform, creating an account, or making a
            payment, the User is deemed to have accepted these Terms.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Description of the service</h2>
          <p className={pClass}>
            Helia AI is a cloud-based software service delivered over the
            internet (SaaS).
          </p>
          <p className={`${pClass} font-medium text-gray-800`}>The platform;</p>
          <ul className={ulClass}>
            <li>Provides AI-assisted content generation</li>
            <li>Transforms text, video, and audio content</li>
            <li>Creates viral-style content (threads, carousels, hooks, etc.)</li>
            <li>Applies usage limits according to the subscription plan</li>
          </ul>
          <p className={pClass}>
            The service does not include physical goods.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Account creation and security</h2>
          <ul className={ulClass}>
            <li>The User must provide accurate and up-to-date information.</li>
            <li>Account security is the User’s responsibility.</li>
            <li>Sharing accounts is prohibited.</li>
            <li>Multiple people using a single account is prohibited.</li>
            <li>Accounts may be suspended if use appears suspicious.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Subscription and payment</h2>
          <ul className={ulClass}>
            <li>The service is paid.</li>
            <li>Prices may be stated in US Dollars (USD).</li>
            <li>Subscriptions renew automatically.</li>
            <li>
              Unless the User cancels, fees are charged at the end of each
              billing period.
            </li>
            <li>
              The User is responsible for taxes, bank fees, and currency
              differences.
            </li>
            <li>The Provider reserves the right to change prices.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Refunds and chargebacks</h2>
          <ul className={ulClass}>
            <li>No refunds after the digital service has been activated.</li>
            <li>
              The User acknowledges that performance of the service begins
              immediately.
            </li>
            <li>
              Unjustified payment disputes (chargebacks) may result in permanent
              account closure.
            </li>
            <li>Service may be terminated if fraud is detected.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Restrictions on use</h2>
          <p className={pClass}>The User may not:</p>
          <ul className={ulClass}>
            <li>Generate unlawful content</li>
            <li>Infringe copyright</li>
            <li>Generate hate, violence, or illegal content</li>
            <li>Abuse spam, bots, or automation</li>
            <li>Exploit security vulnerabilities</li>
            <li>Manipulate API limits</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. AI outputs and liability</h2>
          <ul className={ulClass}>
            <li>Accuracy of generated content is not guaranteed.</li>
            <li>Legal responsibility lies with the User.</li>
            <li>Risk of third-party rights violations lies with the User.</li>
            <li>The User should review content before use.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Service continuity</h2>
          <ul className={ulClass}>
            <li>Uninterrupted service is not guaranteed.</li>
            <li>Maintenance and outages may occur.</li>
            <li>Such events are not grounds for a refund.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Intellectual property</h2>
          <p className={pClass}>
            Platform software, design, and trademarks belong to the Provider.
          </p>
          <p className={pClass}>
            The User receives a limited right to use the service.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Limitation of liability</h2>
          <p className={pClass}>
            Total liability is limited to fees paid by the User.
          </p>
          <p className={pClass}>Indirect damages are excluded.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>11. Account suspension</h2>
          <ul className={ulClass}>
            <li>Breach of these Terms</li>
            <li>Fraud</li>
            <li>Chargeback</li>
            <li>Unlawful use</li>
          </ul>
          <p className={pClass}>may result in account closure.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>12. International use</h2>
          <p className={pClass}>
            The User must comply with the laws of their own country.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>13. Changes</h2>
          <p className={pClass}>
            These Terms may be updated and take effect when published.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>14. Governing law</h2>
          <p className={pClass}>The laws of the Republic of Turkey apply.</p>
          <p className={pClass}>Istanbul courts have jurisdiction.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>15. Contact</h2>
          <p className={pClass}>
            You may contact us via the{" "}
            <Link
              href="/support"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              Support
            </Link>{" "}
            page.
          </p>
        </section>
      </div>
    </article>
  );
}
