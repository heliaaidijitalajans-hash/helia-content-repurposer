import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const h3Class =
  "mt-6 text-base font-bold tracking-tight text-gray-900 first:mt-0";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const dividerClass = "my-10 border-0 border-t border-gray-200";
const examplesLabelClass = "mt-3 text-sm font-medium text-gray-800";

export function CookiePolicyEn() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        COOKIE POLICY
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Last updated: 2026
      </p>

      <div className="mt-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Purpose</h2>
          <p className={pClass}>
            This Cookie Policy explains how cookies are used on the Helia AI
            platform (&quot;Platform&quot;) and informs users accordingly.
          </p>
          <p className={pClass}>
            The Platform uses cookies to improve the user experience, deliver
            services securely, and enhance performance.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>2. What are cookies?</h2>
          <p className={pClass}>
            Cookies are small text files stored on your device via your browser
            by websites you visit.
          </p>
          <p className={pClass}>
            They help remember preferences and improve the browsing experience.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Types of cookies we use</h2>

          <h3 className={h3Class}>3.1 Strictly necessary cookies</h3>
          <p className={pClass}>
            These cookies are required for the platform to function properly.
          </p>
          <p className={examplesLabelClass}>Examples:</p>
          <ul className={ulClass}>
            <li>Session management</li>
            <li>Security verification</li>
            <li>Subscription checks</li>
          </ul>
          <p className={pClass}>These cookies cannot be disabled.</p>

          <hr className={dividerClass} />

          <h3 className={h3Class}>3.2 Performance and analytics cookies</h3>
          <p className={`${pClass} font-medium text-gray-800`}>These cookies are used to:</p>
          <ul className={ulClass}>
            <li>Analyse visitor numbers</li>
            <li>Measure platform performance</li>
            <li>Detect errors</li>
          </ul>
          <p className={pClass}>They typically produce anonymised data.</p>

          <hr className={dividerClass} />

          <h3 className={h3Class}>3.3 Functional cookies</h3>
          <ul className={ulClass}>
            <li>Language preference</li>
            <li>User settings</li>
            <li>Remembering account preferences</li>
          </ul>
          <p className={pClass}>They are used to remember choices and settings.</p>

          <hr className={dividerClass} />

          <h3 className={h3Class}>3.4 Marketing and advertising cookies (if any)</h3>
          <p className={pClass}>
            If third-party advertising services are used on the Platform, cookies
            may be used to deliver content based on user behaviour.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Legal basis</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Cookies are processed on the basis of:</p>
          <ul className={ulClass}>
            <li>Legitimate interest under KVKK</li>
            <li>Performance of a contract</li>
            <li>Consent (for non-essential cookies)</li>
          </ul>
          <p className={pClass}>Consent is obtained for non-essential cookies.</p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Retention</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Cookies may be stored:</p>
          <ul className={ulClass}>
            <li>For the session (session cookies)</li>
            <li>For a defined period (persistent cookies)</li>
          </ul>
          <p className={pClass}>Retention depends on the cookie type.</p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Managing cookies</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Users may:</p>
          <ul className={ulClass}>
            <li>Delete cookies via browser settings</li>
            <li>Block cookies</li>
            <li>Change cookie preferences</li>
          </ul>
          <p className={pClass}>
            Disabling some cookies may prevent the platform from working
            correctly.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Third-party cookies</h2>
          <p className={`${pClass} font-medium text-gray-800`}>The Platform may use cookies set by:</p>
          <ul className={ulClass}>
            <li>Analytics providers</li>
            <li>Payment infrastructure providers</li>
            <li>Cloud and security services</li>
          </ul>
          <p className={pClass}>
            Those cookies are governed by the respective third parties’ privacy
            policies.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>8. International transfers</h2>
          <p className={pClass}>
            Data collected via cookies may be processed on servers located in
            Türkiye or abroad.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Policy updates</h2>
          <p className={pClass}>This Cookie Policy may be updated.</p>
          <p className={pClass}>
            The current version takes effect when published on the platform.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Contact</h2>
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
