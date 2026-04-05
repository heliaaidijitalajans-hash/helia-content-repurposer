import Link from "next/link";
import { testSupabaseConnection } from "@/lib/supabase/test-connection";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function SupabaseTestPage() {
  const config = getPublicSupabaseConfig();
  const result = await testSupabaseConnection();

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-16">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Supabase connection test
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Uses{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        from{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          .env.local
        </code>
        .
      </p>

      <dl className="mt-8 space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Environment
          </dt>
          <dd className="mt-1 font-mono text-xs text-zinc-800 dark:text-zinc-200">
            {config.isConfigured ? (
              <>
                URL set ({config.url.slice(0, 32)}
                …) · anon key set
              </>
            ) : (
              <span className="text-amber-700 dark:text-amber-400">
                Missing URL or anon key — copy .env.example to .env.local
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Result
          </dt>
          <dd className="mt-1">
            {result.ok ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                Connected · {result.latencyMs} ms — {result.detail}
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
        JSON:{" "}
        <Link
          href="/api/supabase/test"
          className="text-violet-600 underline underline-offset-2 dark:text-violet-400"
        >
          /api/supabase/test
        </Link>
      </p>
      <p className="mt-4">
        <Link
          href="/"
          className="text-sm text-zinc-600 underline underline-offset-2 dark:text-zinc-400"
        >
          ← Home
        </Link>
      </p>
    </div>
  );
}
