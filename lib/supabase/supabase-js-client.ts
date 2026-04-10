import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "./config";

function getEnvOrThrow() {
  const { url, anonKey, isConfigured } = getPublicSupabaseConfig();
  if (!isConfigured) {
    if (
      typeof globalThis !== "undefined" &&
      !(globalThis as { __heliaPublicSupabaseWarned?: boolean })
        .__heliaPublicSupabaseWarned
    ) {
      (globalThis as { __heliaPublicSupabaseWarned?: boolean }).__heliaPublicSupabaseWarned =
        true;
      console.warn(
        "[supabase] Eksik NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY (istemci).",
      );
    }
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlayın (.env.example).",
    );
  }
  return { url, anonKey };
}

let browserClient: SupabaseClient | undefined;

/**
 * Next.js ile oturum çerezleri — Client Components + middleware ile uyumlu.
 * (Düz @supabase/supabase-js yerine @supabase/ssr kullanılır.)
 */
export function createClient(): SupabaseClient {
  const { url, anonKey } = getEnvOrThrow();

  if (typeof window === "undefined") {
    return createBrowserClient(url, anonKey);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }
  return browserClient;
}

/** Sunucu tarafı testleri — anon, kalıcı oturum yok. */
export function createAnonSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getEnvOrThrow();
  return createBrowserClient(url, anonKey);
}
