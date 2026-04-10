/**
 * Sunucu tarafında mutlak URL tabanı (fetch, yönlendirme).
 * Vercel: NEXT_PUBLIC_APP_URL veya VERCEL_URL (https ile).
 */
export function getServerAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }
  return "";
}
