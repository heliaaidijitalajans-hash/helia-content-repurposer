import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerSupabaseConfig } from "./config";

/**
 * Sunucu istemcisi — Server Components, Route Handlers, Server Actions.
 * Oturum çerezleri için @supabase/ssr kullanılır (Next.js ile uyumlu).
 * Anon anahtar: isteğe bağlı SUPABASE_ANON_KEY, yoksa NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Tarayıcı: `client.ts` → yalnızca NEXT_PUBLIC_*.
 */
export async function createClient() {
  const { url, anonKey, isConfigured } = getServerSupabaseConfig();
  if (!isConfigured) {
    console.warn(
      "[supabase/server] Eksik Supabase URL veya anon key. SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlayın. Bkz. .env.example",
    );
    throw new Error(
      "Supabase sunucu yapılandırması eksik. .env.example dosyasına bakın.",
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
