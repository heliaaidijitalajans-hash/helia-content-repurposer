/**
 * Absolute API URL (no locale segment). Use for client fetch() so paths never
 * resolve relative to a prefixed pathname like `/tr/...`.
 */
export function apiOriginUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${p}`;
  }
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return `${base}${p}`;
}
