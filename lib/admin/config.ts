/**
 * Yalnızca bu e-posta admin paneli ve /api/admin/* kullanabilir.
 * İsteğe bağlı: HELIA_ADMIN_EMAIL ile override (.env).
 */
const DEFAULT_ADMIN_EMAIL = "helia.ai.digital.ajans@gmail.com";

export function getAdminEmailNormalized(): string {
  const fromEnv = process.env.HELIA_ADMIN_EMAIL?.trim().toLowerCase();
  return (fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_EMAIL).toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase() === getAdminEmailNormalized();
}
