/**
 * Supabase Storage TUS uç noktası — doğrudan storage hostname gerekir.
 * @see https://supabase.com/docs/guides/storage/uploads/resumable-uploads
 */
export function getSupabaseStorageResumableUrl(projectUrl: string): string | null {
  try {
    const host = new URL(projectUrl).hostname.toLowerCase();
    const m = /^([a-z0-9-]+)\.supabase\.co$/i.exec(host);
    if (!m) return null;
    return `https://${m[1]}.storage.supabase.co/storage/v1/upload/resumable`;
  } catch {
    return null;
  }
}
