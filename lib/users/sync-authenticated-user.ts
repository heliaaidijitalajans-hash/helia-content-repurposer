import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Oturumdaki kullanıcıyı `public.users` ile eşitler: satır yoksa oluşturur, varsa dokunmaz.
 */
export async function syncAuthenticatedUserWithUsersTable(
  supabase: SupabaseClient,
): Promise<void> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user?.id) return;

  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr) {
    console.error("[syncUser] select users:", selErr.message);
    return;
  }

  if (existing) return;

  const emailRaw =
    typeof user.email === "string" ? user.email.trim() : "";
  const email = emailRaw ? emailRaw.toLowerCase() : null;

  const { error: insErr } = await supabase.from("users").insert({
    id: user.id,
    email,
    plan: "free",
    video_credits: 30,
    text_credits: 3,
    created_at: new Date().toISOString(),
  });

  if (insErr?.code === "23505") return;
  if (insErr) {
    console.error("[syncUser] insert users:", insErr.message, insErr);
  }
}
