import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseConfig } from "./config";

/**
 * Sunucu istemcisi — Server Components, Route Handlers, Server Actions.
 * Oturum çerezleri için @supabase/ssr kullanılır (Next.js ile uyumlu).
 * Tarayıcıda @supabase/supabase-js: `client.ts` / `supabase-js-client.ts`.
 */
export async function createClient() {
  const { url, anonKey, isConfigured } = getPublicSupabaseConfig();
  if (!isConfigured) {
    throw new Error(
      "Add NEXT_PUBLIC_SUPABASE_URL (Project URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (anon public key). See .env.example.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          void headers;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component — middleware handles session refresh.
          }
        },
      },
    },
  );
}
