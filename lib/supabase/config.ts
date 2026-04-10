/**
 * Tarayıcı + Client Components: yalnızca NEXT_PUBLIC_* (güvenli sızdırma).
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

/**
 * Sunucu: önce gizli SUPABASE_URL, yoksa NEXT_PUBLIC_SUPABASE_URL (Vercel’de genelde yalnızca NEXT_PUBLIC tanımlıdır).
 */
export function getServiceSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    ""
  );
}

/**
 * Server Components / Route Handlers (çerez oturumu).
 * İsteğe bağlı SUPABASE_ANON_KEY (sunucuya özel); yoksa NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * SERVICE_ROLE burada kullanılmaz.
 */
export function getServerSupabaseConfig() {
  const url = getServiceSupabaseUrl();
  const anonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";
  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function isSupabaseServiceRoleConfigured(): boolean {
  return Boolean(
    getServiceSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}
