import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const h3Class =
  "mt-6 text-base font-bold tracking-tight text-gray-900 first:mt-0";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const noteClass = "mt-2 text-sm leading-relaxed text-gray-600 italic";
const dividerClass = "my-10 border-0 border-t border-gray-200";

/** English version of the privacy policy (TR operator; KVKK/GDPR references kept). */
export function PrivacyPolicyEn() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        PRIVACY POLICY
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Last updated: 2026
      </p>

      <div className="mt-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Data controller</h2>
          <p className={pClass}>
            This Privacy Policy sets out how personal data is processed in
            connection with the Helia AI platform operated by Aysel Nur Akıncı.
          </p>
          <p className={`${pClass} font-medium text-gray-800`}>Contact:</p>
          <div className="mt-2 space-y-1 text-sm leading-relaxed text-gray-700">
            <p>
              <span className="font-semibold text-gray-800">Email:</span>{" "}
              <a
                href="mailto:helia.destek@gmail.com"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                helia.destek@gmail.com
              </a>
            </p>
            <p>
              <span className="font-semibold text-gray-800">Address:</span>{" "}
              Istanbul/Silivri, Mimar Sinan Mah., Fatih Sultan Mehmet Cad.
              No:38-R, Apt. 14
            </p>
          </div>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Data collected</h2>
          <p className={pClass}>
            The following categories of data may be collected when you use the
            platform:
          </p>

          <h3 className={h3Class}>2.1 Identity and contact</h3>
          <ul className={ulClass}>
            <li>Name and surname</li>
            <li>Email address</li>
          </ul>

          <h3 className={h3Class}>2.2 Financial</h3>
          <ul className={ulClass}>
            <li>Payment transaction metadata</li>
          </ul>
          <p className={noteClass}>
            (Note: Card details are processed by the payment provider and are not
            stored on our systems.)
          </p>

          <h3 className={h3Class}>2.3 Technical</h3>
          <ul className={ulClass}>
            <li>IP address</li>
            <li>Device information</li>
            <li>Browser information</li>
            <li>Log records</li>
            <li>Cookie data</li>
          </ul>

          <h3 className={h3Class}>2.4 Usage</h3>
          <ul className={ulClass}>
            <li>In-platform activity history</li>
            <li>AI inputs (prompts)</li>
            <li>Generated outputs</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Purposes of processing</h2>
          <p className={pClass}>Collected data is processed to:</p>
          <ul className={ulClass}>
            <li>Provide and maintain the service</li>
            <li>Manage subscriptions</li>
            <li>Process payments</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
            <li>Improve system performance</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Legal bases</h2>
          <p className={pClass}>Processing is based on:</p>
          <ul className={ulClass}>
            <li>Performance of a contract</li>
            <li>Legitimate interests</li>
            <li>Consent (where required)</li>
            <li>Legal obligation</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Retention</h2>
          <p className={pClass}>Personal data may be kept:</p>
          <ul className={ulClass}>
            <li>For the duration of the subscription</li>
            <li>As required by statutory retention rules</li>
            <li>For the duration of potential disputes</li>
          </ul>
          <p className={pClass}>
            After that period, data is deleted, destroyed, or anonymised.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Sharing and transfers</h2>
          <p className={pClass}>Data may be shared with:</p>
          <ul className={ulClass}>
            <li>Payment providers</li>
            <li>Hosting and infrastructure providers</li>
            <li>Cloud service providers</li>
            <li>Public authorities (when legally required)</li>
          </ul>
          <p className={pClass}>
            For international users, data may be processed on servers located in
            Türkiye or other countries.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>7. AI-related data</h2>
          <p className={pClass}>
            Content you submit (prompts) and outputs generated by the service are
            processed to deliver the service.
          </p>
          <p className={pClass}>This data may be analysed in anonymised or aggregate form to:</p>
          <ul className={ulClass}>
            <li>Improve system performance</li>
            <li>Conduct security checks</li>
            <li>Support technical improvements</li>
          </ul>
          <p className={pClass}>
            The provider does not sell user content to third parties for
            commercial purposes.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Security</h2>
          <p className={pClass}>The provider aims to protect personal data using:</p>
          <ul className={ulClass}>
            <li>Technical safeguards</li>
            <li>Encryption where appropriate</li>
            <li>Access controls</li>
            <li>Security protocols</li>
          </ul>
          <p className={pClass}>
            No method of transmission over the internet is completely secure.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Your rights (KVKK &amp; GDPR)</h2>
          <p className={pClass}>You may have the right to:</p>
          <ul className={ulClass}>
            <li>Access your data</li>
            <li>Request correction</li>
            <li>Request erasure</li>
            <li>Object to processing</li>
            <li>Request data portability</li>
          </ul>
          <p className={pClass}>Requests can be sent by email.</p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Cookies</h2>
          <p className={pClass}>
            The platform uses cookies. See our{" "}
            <Link
              href="/cookie-policy"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>11. Changes</h2>
          <p className={pClass}>This Privacy Policy may be updated.</p>
          <p className={pClass}>
            The current version takes effect when published on the platform.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>12. Contact</h2>
          <p className={pClass}>
            For privacy questions, please contact us via our{" "}
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
