import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Link as LocalizedLink } from "@/i18n/navigation";
import { testSupabaseConnection } from "@/lib/supabase/test-connection";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { saasCardClass } from "@/lib/ui/saas-card";

export const dynamic = "force-dynamic";

export default async function SupabaseTestPage() {
  const t = await getTranslations("supabaseTest");
  const config = getPublicSupabaseConfig();
  const result = await testSupabaseConnection();

  return (
    <div className="notranslate mx-auto min-h-screen max-w-lg px-4 py-16 text-slate-100">
      <h1 className="text-xl font-semibold text-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-slate-300">
        {t("introBeforeUrl")}{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-sky-200">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        {t("introAnd")}{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-sky-200">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        {t("introFrom")}{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-sky-200">
          .env.local
        </code>
        {t("introEnd")}
      </p>

      <dl className={`mt-8 space-y-3 text-sm ${saasCardClass}`}>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t("envLabel")}
          </dt>
          <dd className="mt-1 font-mono text-xs text-slate-100">
            {config.isConfigured ? (
              <>
                {t("envOk", { urlPrefix: config.url.slice(0, 32) })}
              </>
            ) : (
              <span className="text-amber-300">
                {t("envMissing")}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t("resultLabel")}
          </dt>
          <dd className="mt-1">
            {result.ok ? (
              <span className="text-emerald-300">
                {t("resultOk", {
                  ms: String(result.latencyMs),
                  detail: result.detail,
                })}
              </span>
            ) : (
              <span className="text-red-300">
                {result.stage}: {result.message}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-slate-400">
        {t("jsonLabel")}{" "}
        <Link
          href="/api/supabase/test"
          className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
        >
          /api/supabase/test
        </Link>
      </p>
      <p className="mt-4">
        <LocalizedLink
          href="/"
          className="text-sm text-slate-400 underline underline-offset-2 hover:text-slate-200"
        >
          {t("homeLink")}
        </LocalizedLink>
      </p>
    </div>
  );
}
