import type { SupabaseClient } from "@supabase/supabase-js";

/** `public.users` satırı — `select("*")` / insert dönüşü */
export type PublicAppUserRow = Record<string, unknown> & {
  id: string;
  text_credits?: number;
  video_credits?: number;
};

/**
 * Oturumdaki kullanıcı için `public.users` satırını getirir; yoksa free plan ile oluşturur.
 * Eşzamanlı iki istekte biri 23505 alırsa tekrar select edilir.
 */
export async function ensurePublicUserRow(
  supabase: SupabaseClient,
): Promise<PublicAppUserRow> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error("No user");
  }

  let { data: dbUser, error: selErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr) {
    console.error("[ensurePublicUserRow] users select:", selErr.message);
    throw new Error(selErr.message);
  }

  if (!dbUser) {
    const { data: newUser, error: insErr } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email ?? null,
        plan: "free",
        video_credits: 30,
        text_credits: 3,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insErr) {
      if (insErr.code === "23505") {
        const { data: again, error: againErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (againErr || !again) {
          console.error(
            "[ensurePublicUserRow] re-fetch after race:",
            againErr?.message,
          );
          throw new Error("Failed to sync user");
        }
        dbUser = again as PublicAppUserRow;
      } else {
        console.error("[ensurePublicUserRow] users insert:", insErr.message);
        throw new Error(insErr.message);
      }
    } else if (newUser) {
      dbUser = newUser as PublicAppUserRow;
    } else {
      throw new Error("Failed to create user row");
    }
  }

  return dbUser as PublicAppUserRow;
}
