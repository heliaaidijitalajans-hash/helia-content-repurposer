import type { SupabaseClient } from "@supabase/supabase-js";
import {
  NOT_ENOUGH_TEXT_CREDITS_MSG,
  NOT_ENOUGH_VIDEO_CREDITS_MSG,
} from "@/lib/credits/constants";
import {
  rpcConsumeUserTextCredit,
  rpcConsumeUserVideoCredit,
} from "@/lib/credits/server-rpc";

export type UseCreditSuccess = { success: true };

/** Route handler’lar için: bilinen hata → HTTP cevabı, aksi halde null. */
export function jsonResponseForUseCreditError(err: unknown): Response | null {
  if (!(err instanceof Error)) return null;
  switch (err.message) {
    case "Unauthorized":
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    case NOT_ENOUGH_TEXT_CREDITS_MSG:
    case NOT_ENOUGH_VIDEO_CREDITS_MSG:
      return Response.json({ error: err.message }, { status: 403 });
    case "User profile not found":
      return Response.json({ error: err.message }, { status: 404 });
    case "Failed to load user profile":
      return Response.json({ error: "Server error" }, { status: 500 });
    default:
      return null;
  }
}

/**
 * Atomik düşüm Postgres’te `consume_user_*` RPC ile yapılır
 * (`UPDATE ... SET video_credits = video_credits - 1 WHERE id = auth.uid() ...`).
 * PostgREST `.update({ ... })` ile sütun-ifadesi gönderilemediği için RPC zorunlu.
 */
export async function useVideoCredit(
  supabase: SupabaseClient,
): Promise<UseCreditSuccess> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) {
    console.error("[useVideoCredit] auth.getUser failed:", authErr.message);
    throw new Error("Unauthorized");
  }
  if (!user) {
    console.warn("[useVideoCredit] No authenticated user");
    throw new Error("Unauthorized");
  }

  const { data: profile, error: selectErr } = await supabase
    .from("users")
    .select("id, video_credits")
    .eq("id", user.id)
    .maybeSingle();

  if (selectErr) {
    console.error("[useVideoCredit] users select failed:", selectErr.message);
    throw new Error("Failed to load user profile");
  }
  if (!profile) {
    console.error("[useVideoCredit] Missing users row for id:", user.id);
    throw new Error("User profile not found");
  }
  if (profile.video_credits <= 0) {
    console.warn("[useVideoCredit] No video credits for user:", user.id);
    throw new Error(NOT_ENOUGH_VIDEO_CREDITS_MSG);
  }

  const consumed = await rpcConsumeUserVideoCredit(supabase);
  if (!consumed?.ok) {
    console.warn(
      "[useVideoCredit] Atomic consume failed (race or drift) for user:",
      user.id,
    );
    throw new Error(NOT_ENOUGH_VIDEO_CREDITS_MSG);
  }

  console.log(
    "[useVideoCredit] success, remaining video_credits:",
    consumed.remaining,
  );
  return { success: true };
}

export async function useTextCredit(
  supabase: SupabaseClient,
): Promise<UseCreditSuccess> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) {
    console.error("[useTextCredit] auth.getUser failed:", authErr.message);
    throw new Error("Unauthorized");
  }
  if (!user) {
    console.warn("[useTextCredit] No authenticated user");
    throw new Error("Unauthorized");
  }

  const { data: profile, error: selectErr } = await supabase
    .from("users")
    .select("id, text_credits")
    .eq("id", user.id)
    .maybeSingle();

  if (selectErr) {
    console.error("[useTextCredit] users select failed:", selectErr.message);
    throw new Error("Failed to load user profile");
  }
  if (!profile) {
    console.error("[useTextCredit] Missing users row for id:", user.id);
    throw new Error("User profile not found");
  }
  if (profile.text_credits <= 0) {
    console.warn("[useTextCredit] No text credits for user:", user.id);
    throw new Error(NOT_ENOUGH_TEXT_CREDITS_MSG);
  }

  const consumed = await rpcConsumeUserTextCredit(supabase);
  if (!consumed?.ok) {
    console.warn(
      "[useTextCredit] Atomic consume failed (race or drift) for user:",
      user.id,
    );
    throw new Error(NOT_ENOUGH_TEXT_CREDITS_MSG);
  }

  console.log(
    "[useTextCredit] success, remaining text_credits:",
    consumed.remaining,
  );
  return { success: true };
}
