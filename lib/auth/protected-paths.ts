/** Locale öneki olmadan korunan SaaS rotaları (middleware + requireSession). */
export const STANDALONE_PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/generate",
  "/history",
  "/account",
  "/settings",
  "/checkout",
  "/support",
] as const;

export function isStandaloneProtectedPath(pathname: string): boolean {
  return STANDALONE_PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
