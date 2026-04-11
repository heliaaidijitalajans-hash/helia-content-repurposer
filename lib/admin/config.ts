/**
 * Admin paneli ve /api/admin/* için izinli e-postalar.
 * İki yazım farklı Gmail hesaplarıdır: digital vs dijital — ikisi de admin.
 * İsteğe bağlı: HELIA_ADMIN_EMAIL ile ek adres (.env, sunucu).
 */
export const ADMIN_EMAIL = "helia.ai.digital.ajans@gmail.com";

const DEFAULT_ADMIN_EMAILS = [
  "helia.ai.digital.ajans@gmail.com",
  "helia.ai.dijital.ajans@gmail.com",
] as const;

function adminEmailsNormalized(): Set<string> {
  const set = new Set(
    DEFAULT_ADMIN_EMAILS.map((e) => e.trim().toLowerCase()),
  );
  const fromEnv = process.env.HELIA_ADMIN_EMAIL?.trim().toLowerCase();
  if (fromEnv && fromEnv.length > 0) set.add(fromEnv);
  return set;
}

/** @deprecated Tek adres için; çoklu admin setine bakın. */
export function getAdminEmailNormalized(): string {
  return ADMIN_EMAIL.toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  return adminEmailsNormalized().has(email.trim().toLowerCase());
}
