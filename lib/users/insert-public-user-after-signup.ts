import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

function nameFromUser(user: User, displayName: string): string {
  const trimmed = displayName.trim();
  if (trimmed) return trimmed;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (typeof meta?.full_name === "string" && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  return "";
}

/**
 * `signUp` başarılı olduktan sonra `public.users` satırı (RLS: oturumdaki kullanıcı = satır id).
 * Insert başarısız olsa bile fırlatmaz; konsola yazar, UI `profileSyncWarning` ile bilgilendirir.
 * Tetikleyici satır eklemişse 23505 → yalnızca email / name / updated_at güncellenir (krediler korunur).
 */
export async function insertPublicUserAfterSignup(
  supabase: SupabaseClient,
  input: { user: User; displayName: string; session?: Session | null },
): Promise<{ profileSyncWarning: boolean }> {
  const { user, displayName, session: sessionFromSignUp } = input;

  if (!user) {
    console.log("User not ready yet");
    return { profileSyncWarning: false };
  }

  const session =
    sessionFromSignUp ??
    (await supabase.auth.getSession()).data.session;

  if (!session || session.user.id !== user.id) {
    console.warn(
      "[insertPublicUserAfterSignup] Oturum yok veya kullanıcı eşleşmiyor; istemci insert atlandı (RLS). DB tetikleyicisi satır oluşturmuş olmalı.",
    );
    return { profileSyncWarning: false };
  }

  const now = new Date().toISOString();
  const emailNorm = user.email?.trim().toLowerCase() || null;
  const name = nameFromUser(user, displayName);

  try {
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email: emailNorm,
      name: name || "",
      plan: "free",
      video_credits: 30,
      text_credits: 3,
      created_at: now,
      updated_at: now,
    });

    console.log("INSERT ERROR:", insertError);

    if (insertError) {
      if (insertError.code === "23505") {
        const { error: patchError } = await supabase
          .from("users")
          .update({
            email: emailNorm,
            name: name || "",
            updated_at: now,
          })
          .eq("id", user.id);

        if (patchError) {
          console.error("User insert error (then patch):", insertError);
          console.error("User row patch error:", patchError);
          return { profileSyncWarning: true };
        }
        return { profileSyncWarning: false };
      }

      console.error("User insert error:", insertError);
      return { profileSyncWarning: true };
    }
  } catch (e) {
    console.error("User insert error (exception):", e);
    return { profileSyncWarning: true };
  }

  return { profileSyncWarning: false };
}
