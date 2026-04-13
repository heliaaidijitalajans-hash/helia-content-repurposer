import type { User } from "@supabase/supabase-js";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import type { PublicAppUserRow } from "@/lib/users/public-app-user-types";

/**
 * Oturumu doğrulanmış kullanıcı için `public.users` satırını service role ile oluşturur/günceller.
 * Tarayıcıda RLS (403 / policy) hatalarından kaçınmak için kullanılır.
 */
export async function upsertPublicUsersRowForAuthUser(
  user: User,
): Promise<PublicAppUserRow> {
  if (!isServiceRoleConfigured()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY required for ensure-app-row service");
  }

  const admin = createServiceRoleClient();
  const { data: existing, error: selErr } = await admin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr) {
    throw new Error(selErr.message);
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name =
    typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  const emailNorm = user.email?.trim()
    ? user.email.trim().toLowerCase()
    : null;

  if (existing) {
    const row = existing as PublicAppUserRow;
    const rowEmail =
      typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
    if (emailNorm && (rowEmail === "" || rowEmail !== emailNorm)) {
      const { error: upErr } = await admin
        .from("users")
        .update({ email: emailNorm, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (!upErr) {
        return { ...row, email: emailNorm } as PublicAppUserRow;
      }
    }
    return row;
  }

  const { data: planRow } = await admin
    .from("plans")
    .select("video_limit, text_limit")
    .eq("name", "free")
    .maybeSingle();

  const video =
    typeof planRow?.video_limit === "number" ? planRow.video_limit : 30;
  const text =
    typeof planRow?.text_limit === "number" ? planRow.text_limit : 3;
  const now = new Date().toISOString();

  const { data: created, error: insErr } = await admin
    .from("users")
    .insert({
      id: user.id,
      email: emailNorm,
      name,
      plan: "free",
      video_credits: video,
      text_credits: text,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (!insErr && created) {
    return created as PublicAppUserRow;
  }

  if (insErr?.code === "23505") {
    const { data: again, error: againErr } = await admin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!againErr && again) {
      return again as PublicAppUserRow;
    }
  }

  throw new Error(insErr?.message ?? "Failed to create users row");
}
