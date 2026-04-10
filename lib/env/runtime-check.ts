/**
 * Sunucu başlangıcında ortam değişkeni özeti (throw yok — yalnızca log).
 * Production’da süreci düşürmez; eksiklikleri Vercel loglarında görünür kılar.
 */
let didLog = false;

export function logServerEnvOnStartup(): void {
  if (didLog) return;
  didLog = true;

  const issues: string[] = [];

  const privateUrl = process.env.SUPABASE_URL?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!privateUrl && !publicUrl) {
    issues.push(
      "Eksik SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_URL — Supabase bağlantısı çalışmaz.",
    );
  } else if (!publicUrl) {
    issues.push(
      "Eksik NEXT_PUBLIC_SUPABASE_URL — tarayıcı / SSR public config için gerekli (çoğu kurulumda zorunlu).",
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    issues.push(
      "Eksik NEXT_PUBLIC_SUPABASE_ANON_KEY — istemci ve sunucu (SSR) anon yolları için gerekli; isteğe bağlı ek: SUPABASE_ANON_KEY.",
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    issues.push(
      "Eksik SUPABASE_SERVICE_ROLE_KEY — service role API’ler (kredi, storage, select-plan) 5xx verebilir.",
    );
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    issues.push(
      "Eksik OPENAI_API_KEY — AI çıktıları demo / sınırlı modda kalabilir.",
    );
  }

  if (!process.env.NEXT_PUBLIC_APP_URL?.trim() && !process.env.VERCEL_URL) {
    issues.push(
      "NEXT_PUBLIC_APP_URL tanımlı değil — OAuth redirect ve sunucu fetch için üretimde https://heliaai.online gibi kök URL verin.",
    );
  }

  if (issues.length > 0) {
    console.warn(
      `[env] ${issues.length} uyarı (deploy sonrası 502/503 önlemek için Vercel Environment Variables kontrol edin):\n- ${issues.join("\n- ")}`,
    );
  } else {
    console.info(
      "[env] Temel Supabase URL + anon + service role + OpenAI anahtarları tanımlı görünüyor.",
    );
  }
}
