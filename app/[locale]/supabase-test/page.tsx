import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Link as LocalizedLink } from "@/i18n/navigation";
import { testSupabaseConnection } from "@/lib/supabase/test-connection";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { lightCardClass } from "@/lib/ui/saas-card";

export const dynamic = "force-dynamic";

export default async function SupabaseTestPage() {
  const t = await getTranslations("supabaseTest");
  const config = getPublicSupabaseConfig();
  const result = await testSupabaseConnection();

  return (
    <div className="notranslate mx-auto min-h-screen max-w-lg bg-white px-4 py-16 text-gray-900">
      <h1 className="text-xl font-semibold text-gray-900">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {t("introBeforeUrl")}{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-800">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        {t("introAnd")}{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-800">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        {t("introFrom")}{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-800">
          .env.local
        </code>
        {t("introEnd")}
      </p>

      <dl className={`mt-8 space-y-3 text-sm ${lightCardClass}`}>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t("envLabel")}
          </dt>
          <dd className="mt-1 font-mono text-xs text-gray-800">
            {config.isConfigured ? (
              <>
                {t("envOk", { urlPrefix: config.url.slice(0, 32) })}
              </>
            ) : (
              <span className="text-amber-700">
                {t("envMissing")}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t("resultLabel")}
          </dt>
          <dd className="mt-1">
            {result.ok ? (
              <span className="text-emerald-700">
                {t("resultOk", {
                  ms: String(result.latencyMs),
                  detail: result.detail,
                })}
              </span>
            ) : (
              <span className="text-red-600">
                {result.stage}: {result.message}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-gray-500">
        {t("jsonLabel")}{" "}
        <Link
          href="/api/supabase/test"
          className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
        >
          /api/supabase/test
        </Link>
      </p>
      <p className="mt-4">
        <LocalizedLink
          href="/"
          className="text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900"
        >
          {t("homeLink")}
        </LocalizedLink>
      </p>
    </div>
  );
}
