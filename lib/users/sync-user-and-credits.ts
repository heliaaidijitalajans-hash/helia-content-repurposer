import type { SupabaseClient } from "@supabase/supabase-js";
import { ensurePublicUserRow } from "@/lib/users/ensure-public-user-row-client";

export async function syncUser(supabase: SupabaseClient): Promise<void> {
  let existingUser: Awaited<ReturnType<typeof ensurePublicUserRow>>;
  try {
    existingUser = await ensurePublicUserRow(supabase);
  } catch (e) {
    if (e instanceof Error && e.message === "No user") {
      console.log("No user found");
      return;
    }
    console.error("syncUser:", e);
    return;
  }

  if (!existingUser.plan) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ plan: "free" })
      .eq("id", existingUser.id);

    if (updateError) {
      console.error("Update error:", updateError);
    }
  }

  console.log("User synced ✅");
}

/** Geriye dönük isim — `syncUser` ile aynı. */
export async function syncUserAndCredits(
  supabase: SupabaseClient,
): Promise<void> {
  await syncUser(supabase);
}
