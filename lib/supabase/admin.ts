import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getServiceSupabaseUrl,
  isSupabaseServiceRoleConfigured,
} from "./config";

export { getServiceSupabaseUrl } from "./config";

export function isServiceRoleConfigured(): boolean {
  return isSupabaseServiceRoleConfigured();
}

/**
 * Storage / RLS bypass — yalnızca Route Handler ve sunucu kodu.
 * Anahtarı asla istemciye vermeyin.
 */
export function createServiceRoleClient(): SupabaseClient {
  const url = getServiceSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.warn(
      "[supabase/admin] createServiceRoleClient: eksik SUPABASE_SERVICE_ROLE_KEY veya Supabase URL.",
    );
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (veya NEXT_PUBLIC_SUPABASE_URL) gerekli.",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
