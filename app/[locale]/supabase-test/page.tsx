import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Link as LocalizedLink } from "@/i18n/navigation";
import { testSupabaseConnection } from "@/lib/supabase/test-connection";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function SupabaseTestPage() {
  const t = await getTranslations("supabaseTest");
  const config = getPublicSupabaseConfig();
  const result = await testSupabaseConnection();

  return (
    <div className="notranslate mx-auto min-h-screen max-w-lg px-4 py-16">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {t("introBeforeUrl")}{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        {t("introAnd")}{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        {t("introFrom")}{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          .env.local
        </code>
        {t("introEnd")}
      </p>

      <dl className="mt-8 space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("envLabel")}
          </dt>
          <dd className="mt-1 font-mono text-xs text-zinc-800 dark:text-zinc-200">
            {config.isConfigured ? (
              <>
                {t("envOk", { urlPrefix: config.url.slice(0, 32) })}
              </>
            ) : (
              <span className="text-amber-700 dark:text-amber-400">
                {t("envMissing")}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("resultLabel")}
          </dt>
          <dd className="mt-1">
            {result.ok ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                {t("resultOk", {
                  ms: String(result.latencyMs),
                  detail: result.detail,
                })}
              </span>
            ) : (
              <span className="text-red-700 dark:text-red-400">
                {result.stage}: {result.message}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-zinc-500">
        {t("jsonLabel")}{" "}
        <Link
          href="/api/supabase/test"
          className="text-violet-600 underline underline-offset-2 dark:text-violet-400"
        >
          /api/supabase/test
        </Link>
      </p>
      <p className="mt-4">
        <LocalizedLink
          href="/"
          className="text-sm text-zinc-600 underline underline-offset-2 dark:text-zinc-400"
        >
          {t("homeLink")}
        </LocalizedLink>
      </p>
    </div>
  );
}
