import type { SupabaseClient } from "@supabase/supabase-js";

export async function syncUser(supabase: SupabaseClient): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log("No user found");
    return;
  }

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Fetch user error:", fetchError);
    return;
  }

  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email ?? null,
      plan: "free",
      video_credits: 30,
      text_credits: 3,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        console.log("User row already exists (race) ✅");
        return;
      }
      console.error("Insert user error:", insertError);
    } else {
      console.log("User created with credits ✅");
    }

    return;
  }

  if (!existingUser.plan) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ plan: "free" })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
    }
  }

  console.log("User already exists ✅");
}

/** Geriye dönük isim — `syncUser` ile aynı. */
export async function syncUserAndCredits(
  supabase: SupabaseClient,
): Promise<void> {
  await syncUser(supabase);
}
