import type { SupabaseClient } from "@supabase/supabase-js";

type ReserveRow = { ok: boolean; remaining: number };

function firstRow<T>(data: unknown): T | null {
  if (data == null) return null;
  if (Array.isArray(data)) {
    const row = data[0];
    return row && typeof row === "object" ? (row as T) : null;
  }
  if (typeof data === "object") {
    return data as T;
  }
  return null;
}

export async function rpcReserveTextCredit(
  supabase: SupabaseClient,
): Promise<ReserveRow | null> {
  const { data, error } = await supabase.rpc("reserve_text_credit");
  if (error) {
    console.error("[credits] reserve_text_credit", error.message);
    return null;
  }
  const row = firstRow<ReserveRow>(data);
  if (!row || typeof row.ok !== "boolean") return null;
  return {
    ok: row.ok,
    remaining: typeof row.remaining === "number" ? row.remaining : 0,
  };
}

export async function rpcRefundTextCredit(
  supabase: SupabaseClient,
): Promise<void> {
  const { error } = await supabase.rpc("refund_text_credit");
  if (error) {
    console.error("[credits] refund_text_credit", error.message);
  }
}

export async function rpcReserveVideoCredits(
  supabase: SupabaseClient,
  minutes: number,
): Promise<ReserveRow | null> {
  const { data, error } = await supabase.rpc("reserve_video_credits", {
    p_minutes: minutes,
  });
  if (error) {
    console.error("[credits] reserve_video_credits", error.message);
    return null;
  }
  const row = firstRow<ReserveRow>(data);
  if (!row || typeof row.ok !== "boolean") return null;
  return {
    ok: row.ok,
    remaining: typeof row.remaining === "number" ? row.remaining : 0,
  };
}

export async function rpcRefundVideoCredits(
  supabase: SupabaseClient,
  minutes: number,
): Promise<void> {
  const { error } = await supabase.rpc("refund_video_credits", {
    p_minutes: minutes,
  });
  if (error) {
    console.error("[credits] refund_video_credits", error.message);
  }
}
