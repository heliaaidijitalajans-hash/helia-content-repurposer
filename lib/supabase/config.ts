/**
 * Public Supabase credentials (safe to expose in the browser via NEXT_PUBLIC_*).
 * Dashboard → Project Settings → API: Project URL + anon public key.
 */
export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}
