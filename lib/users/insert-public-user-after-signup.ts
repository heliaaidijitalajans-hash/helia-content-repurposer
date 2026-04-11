import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * signUp sonrası public.users satırı: oturum varsa (RLS) insert dener.
 * Tetikleyici zaten satır oluşturmuşsa 23505 → name/email güncellenir.
 * Hata olursa kaydı bozmaz; `profileSyncWarning: true` ile UI çeviri anahtarı gösterilir.
 */
export async function insertPublicUserAfterSignup(
  supabase: SupabaseClient,
  input: { user: User; displayName: string },
): Promise<{ profileSyncWarning: boolean }> {
  const { user, displayName } = input;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.id !== user.id) {
    console.warn(
      "[insertPublicUserAfterSignup] Oturum yok veya kullanıcı eşleşmiyor; istemci insert atlandı (RLS). Tetikleyici satır oluşturmuş olmalı.",
    );
    return { profileSyncWarning: false };
  }

  const now = new Date().toISOString();
  const emailNorm = user.email?.trim().toLowerCase() || null;
  const name = displayName?.trim() || "";

  try {
    const { error } = await supabase.from("users").insert({
      id: user.id,
      email: emailNorm,
      name,
      plan: "free",
      video_credits: 30,
      text_credits: 3,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      if (error.code === "23505") {
        console.info(
          "[insertPublicUserAfterSignup] Satır zaten var (id), name/email güncelleniyor",
        );
        const { error: upErr } = await supabase
          .from("users")
          .update({
            email: emailNorm,
            name,
            updated_at: now,
          })
          .eq("id", user.id);

        if (upErr) {
          console.error(
            "[insertPublicUserAfterSignup] güncelleme hatası:",
            upErr.code,
            upErr.message,
          );
          return { profileSyncWarning: true };
        }
        return { profileSyncWarning: false };
      }

      console.error(
        "[insertPublicUserAfterSignup] insert hatası:",
        error.code,
        error.message,
      );
      return { profileSyncWarning: true };
    }
  } catch (e) {
    console.error("[insertPublicUserAfterSignup] istisna:", e);
    return { profileSyncWarning: true };
  }

  return { profileSyncWarning: false };
}
