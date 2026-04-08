import { Link } from "@/i18n/navigation";

const sectionClass = "mb-10 last:mb-0";
const h2Class = "text-lg font-bold tracking-tight text-gray-900";
const h3Class =
  "mt-6 text-base font-bold tracking-tight text-gray-900 first:mt-0";
const pClass = "mt-3 text-sm leading-relaxed text-gray-700";
const ulClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700";
const dividerClass = "my-10 border-0 border-t border-gray-200";
const noteClass = "mt-2 text-sm leading-relaxed text-gray-600 italic";
const addressClass = "mt-3 space-y-1 text-sm leading-relaxed text-gray-700";

/**
 * English summary of the KVKK (Turkish Law No. 6698) privacy notice.
 * Binding text for Turkish users is the Turkish version.
 */
export function KvkkNoticeEn() {
  return (
    <article>
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        KVKK PRIVACY NOTICE (Law No. 6698 on the Protection of Personal Data)
      </h1>
      <p className="mt-4 text-sm font-medium text-gray-500">
        Last updated: 2026
      </p>

      <div className="mt-10">
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Data controller</h2>
          <p className={pClass}>
            Under the Turkish Law on the Protection of Personal Data No. 6698
            (&quot;KVKK&quot;), your personal data is processed as data
            controller by:
          </p>
          <div className={addressClass}>
            <p className="font-semibold text-gray-800">Aysel Nur Akıncı</p>
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

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Categories of personal data</h2>
          <p className={pClass}>
            In connection with the Helia AI platform, the following may be
            processed:
          </p>

          <h3 className={h3Class}>Identity and contact</h3>
          <ul className={ulClass}>
            <li>Name and surname</li>
            <li>Email address</li>
          </ul>

          <h3 className={h3Class}>Financial</h3>
          <ul className={ulClass}>
            <li>Payment transaction metadata</li>
          </ul>
          <p className={noteClass}>
            (Note: Card data is processed by the payment provider and is not
            stored on our systems.)
          </p>

          <h3 className={h3Class}>Transaction security</h3>
          <ul className={ulClass}>
            <li>IP address</li>
            <li>Device and browser information</li>
            <li>Log records</li>
          </ul>

          <h3 className={h3Class}>Usage data</h3>
          <ul className={ulClass}>
            <li>Platform usage history</li>
            <li>AI inputs (prompts)</li>
            <li>Generated digital content</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Purposes of processing</h2>
          <p className={`${pClass} font-medium text-gray-800`}>
            Personal data is processed to:
          </p>
          <ul className={ulClass}>
            <li>Provide the service and perform the contract</li>
            <li>Manage subscriptions and payments</li>
            <li>Maintain system security</li>
            <li>Prevent abuse and fraud</li>
            <li>Comply with legal obligations</li>
            <li>Improve service quality</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Transfers</h2>
          <p className={`${pClass} font-medium text-gray-800`}>
            Personal data may be transferred, in line with KVKK Articles 8 and
            9, to:
          </p>
          <ul className={ulClass}>
            <li>Payment providers</li>
            <li>Hosting and infrastructure providers</li>
            <li>Cloud service providers</li>
            <li>Competent public authorities where required by law</li>
          </ul>
          <p className={pClass}>
            For international users, data may be processed on servers located
            abroad.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Collection methods and legal bases</h2>
          <p className={`${pClass} font-medium text-gray-800`}>Data is collected:</p>
          <ul className={ulClass}>
            <li>Electronically via the website and app</li>
            <li>During registration and payment</li>
            <li>Through cookies and logs</li>
          </ul>
          <p className={`${pClass} mt-4 font-medium text-gray-800`}>
            Processing is based on:
          </p>
          <ul className={ulClass}>
            <li>Establishment and performance of a contract</li>
            <li>Legitimate interests of the controller</li>
            <li>Compliance with legal obligations</li>
            <li>Explicit consent (where required)</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Rights of the data subject</h2>
          <p className={pClass}>
            Under KVKK Article 11, you have the right to:
          </p>
          <ul className={ulClass}>
            <li>Learn whether your data is processed</li>
            <li>Request information if it is processed</li>
            <li>Learn the purpose of processing and whether use is consistent</li>
            <li>Learn third parties to whom data is transferred domestically or abroad</li>
            <li>Request correction if data is incomplete or inaccurate</li>
            <li>Request erasure or destruction where conditions under KVKK are met</li>
            <li>Object to processing</li>
            <li>Exercise remedies available under the law</li>
          </ul>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>7. How to submit a request</h2>
          <p className={pClass}>You may submit KVKK requests in writing to:</p>
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
            Requests will be answered within the statutory timeframe.
          </p>
        </section>

        <hr className={dividerClass} />

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Contact</h2>
          <p className={pClass}>
            For other questions, please use our{" "}
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
