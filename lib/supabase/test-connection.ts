import { getPublicSupabaseConfig } from "./config";
import { createAnonSupabaseClient } from "./supabase-js-client";

export type ConnectionTestResult =
  | {
      ok: true;
      latencyMs: number;
      detail: string;
      extra?: Record<string, unknown>;
    }
  | {
      ok: false;
      stage: "env" | "network" | "api";
      message: string;
      latencyMs?: number;
      status?: number;
    };

/**
 * Verifies reachability of the Supabase project using the anon key (no user session).
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const { url, anonKey, isConfigured } = getPublicSupabaseConfig();

  if (!isConfigured) {
    return {
      ok: false,
      stage: "env",
      message:
        "Set NEXT_PUBLIC_SUPABASE_URL (Project URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (anon public key) in .env.local — see .env.example.",
    };
  }

  const base = url.replace(/\/$/, "");
  const started = Date.now();

  try {
    const healthRes = await fetch(`${base}/auth/v1/health`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    const latencyMs = Date.now() - started;

    if (healthRes.ok) {
      const extra = (await healthRes.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      return {
        ok: true,
        latencyMs,
        detail: "Auth service responded (GET /auth/v1/health).",
        extra: extra ?? undefined,
      };
    }

    // Fallback: exercise PostgREST with the JS client (table may be absent).
    const supabase = createAnonSupabaseClient();

    const { error } = await supabase.from("repurposes").select("id").limit(0);
    const latencyRest = Date.now() - started;

    if (!error) {
      return {
        ok: true,
        latencyMs: latencyRest,
        detail: "REST API queried repurposes successfully.",
      };
    }

    if (
      error.code === "PGRST205" ||
      /schema cache|does not exist|Could not find the table/i.test(
        error.message ?? "",
      )
    ) {
      return {
        ok: true,
        latencyMs: latencyRest,
        detail:
          "REST API reachable (repurposes table not created yet — optional).",
      };
    }

    if (/fetch|network|Failed to fetch/i.test(error.message ?? "")) {
      return {
        ok: false,
        stage: "network",
        message: error.message,
        latencyMs: latencyRest,
      };
    }

    return {
      ok: false,
      stage: "api",
      message: `${healthRes.status} on /auth/v1/health; REST: ${error.message}`,
      status: healthRes.status,
      latencyMs: latencyRest,
    };
  } catch (e) {
    return {
      ok: false,
      stage: "network",
      message: e instanceof Error ? e.message : "Unknown error",
      latencyMs: Date.now() - started,
    };
  }
}
