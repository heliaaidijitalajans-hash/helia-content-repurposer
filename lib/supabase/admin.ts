import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Sunucu: SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_URL */
export function getServiceSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    ""
  );
}

/**
 * Storage indirme/silme için service role (RLS bypass).
 * Sunucuda yalnızca route handler’larda kullanın; anahtarı asla istemciye sızdırmayın.
 */
export function isServiceRoleConfigured(): boolean {
  return Boolean(
    getServiceSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export function createServiceRoleClient(): SupabaseClient {
  const url = getServiceSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (veya NEXT_PUBLIC_SUPABASE_URL) gerekli.",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
