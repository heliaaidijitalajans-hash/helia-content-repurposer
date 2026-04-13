import type { SupabaseClient, User } from "@supabase/supabase-js";
import { apiOriginUrl } from "@/lib/api/origin-url";
import type { PublicAppUserRow } from "@/lib/users/public-app-user-types";

export type { PublicAppUserRow };

async function ensurePublicUserRowDirect(
  supabase: SupabaseClient,
  user: User,
): Promise<PublicAppUserRow> {
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
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const fromMeta =
      typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
    const now = new Date().toISOString();
    const { data: newUser, error: insErr } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email?.trim() ? user.email.trim().toLowerCase() : null,
        name: fromMeta,
        plan: "free",
        video_credits: 30,
        text_credits: 3,
        created_at: now,
        updated_at: now,
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
  } else if (user.email?.trim()) {
    const rowEmail =
      typeof dbUser.email === "string" ? dbUser.email.trim() : "";
    const norm = user.email.trim().toLowerCase();
    if (rowEmail === "" || rowEmail.toLowerCase() !== norm) {
      const { error: upErr } = await supabase
        .from("users")
        .update({ email: norm })
        .eq("id", user.id);
      if (upErr) {
        console.warn("[ensurePublicUserRow] email backfill:", upErr.message);
      } else {
        dbUser = { ...dbUser, email: norm } as PublicAppUserRow;
      }
    }
  }

  return dbUser as PublicAppUserRow;
}

/**
 * Oturumdaki kullanıcı için `public.users` satırını getirir; yoksa free plan ile oluşturur.
 * Tarayıcıda önce `/api/users/ensure-app-row` (service role) denenir — RLS 403/policy hatalarını önler.
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

  if (typeof window !== "undefined") {
    try {
      const res = await fetch(apiOriginUrl("/api/users/ensure-app-row"), {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 401) {
        throw new Error("No user");
      }
      if (res.ok) {
        const json = (await res.json()) as { user?: PublicAppUserRow };
        if (json.user?.id) {
          return json.user;
        }
      }
      const errText = await res.text().catch(() => "");
      console.warn(
        "[ensurePublicUserRow] ensure-app-row API fallback:",
        res.status,
        errText.slice(0, 200),
      );
    } catch (e) {
      console.warn("[ensurePublicUserRow] ensure-app-row API:", e);
    }
    return ensurePublicUserRowDirect(supabase, user);
  }

  const { isServiceRoleConfigured } = await import("@/lib/supabase/admin");
  if (isServiceRoleConfigured()) {
    const { upsertPublicUsersRowForAuthUser } = await import(
      "@/lib/users/ensure-app-row-service"
    );
    return upsertPublicUsersRowForAuthUser(user);
  }

  return ensurePublicUserRowDirect(supabase, user);
}
