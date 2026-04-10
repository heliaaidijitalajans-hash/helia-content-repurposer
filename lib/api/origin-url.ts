import { getServerAppOrigin } from "@/lib/site/app-origin";

/**
 * Absolute API URL (no locale segment). Client: window origin; server: env / Vercel.
 */
export function apiOriginUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${p}`;
  }
  const base = getServerAppOrigin();
  if (!base) return p;
  return `${base}${p}`;
}