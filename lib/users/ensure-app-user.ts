import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Giriş / kayıt sonrası: oturumdaki kullanıcı için `public.users` satırı yoksa oluşturur.
 * Varsa dokunmaz (id veya e-posta ile mevcut satır).
 */
export async function ensureAppUserAfterAuth(supabase: SupabaseClient): Promise<void> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user?.id) return;

  const emailNorm = user.email?.trim().toLowerCase() ?? null;

  const { data: byId } = await supabase
    .from("users")
    .select("id,email")
    .eq("id", user.id)
    .maybeSingle();

  if (byId) {
    if (emailNorm && (!byId.email || String(byId.email).trim() === "")) {
      const { error: patchErr } = await supabase
        .from("users")
        .update({ email: emailNorm })
        .eq("id", user.id);
      if (patchErr) {
        console.error("[ensureAppUser] email backfill:", patchErr.message);
      }
    }
    return;
  }

  if (emailNorm) {
    const { data: byEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle();
    if (byEmail) {
      if (byEmail.id !== user.id) {
        console.error("[ensureAppUser] email already tied to another user");
      }
      return;
    }
  }

  const { error: insErr } = await supabase.from("users").insert({
    id: user.id,
    email: emailNorm,
    plan: "free",
    video_credits: 30,
    text_credits: 3,
  });

  if (insErr?.code === "23505") return;
  if (insErr) {
    console.error("[ensureAppUser] insert:", insErr.message, insErr);
  }
}
