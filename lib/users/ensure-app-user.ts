import type { SupabaseClient } from "@supabase/supabase-js";
import { syncUserAndCredits } from "@/lib/users/sync-user-and-credits";

/** Giriş / callback sonrası — dönüş değeri kullanılmaz. */
export async function ensureAppUserAfterAuth(
  supabase: SupabaseClient,
): Promise<void> {
  await syncUserAndCredits(supabase);
}
