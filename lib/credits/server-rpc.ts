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

export async function rpcConsumeUserTextCredit(
  supabase: SupabaseClient,
): Promise<ReserveRow | null> {
  const { data, error } = await supabase.rpc("consume_user_text_credit");
  if (error) {
    console.error("[credits] consume_user_text_credit", error.message);
    return null;
  }
  const row = firstRow<ReserveRow>(data);
  if (!row || typeof row.ok !== "boolean") return null;
  return {
    ok: row.ok,
    remaining: typeof row.remaining === "number" ? row.remaining : 0,
  };
}

export async function rpcRefundUserTextCredit(
  supabase: SupabaseClient,
): Promise<void> {
  const { error } = await supabase.rpc("refund_user_text_credit");
  if (error) {
    console.error("[credits] refund_user_text_credit", error.message);
  }
}

export async function rpcConsumeUserVideoCredit(
  supabase: SupabaseClient,
): Promise<ReserveRow | null> {
  const { data, error } = await supabase.rpc("consume_user_video_credit");
  if (error) {
    console.error("[credits] consume_user_video_credit", error.message);
    return null;
  }
  const row = firstRow<ReserveRow>(data);
  if (!row || typeof row.ok !== "boolean") return null;
  return {
    ok: row.ok,
    remaining: typeof row.remaining === "number" ? row.remaining : 0,
  };
}

export async function rpcRefundUserVideoCredit(
  supabase: SupabaseClient,
): Promise<void> {
  const { error } = await supabase.rpc("refund_user_video_credit");
  if (error) {
    console.error("[credits] refund_user_video_credit", error.message);
  }
}

/** Service role: atomik text_credits -= 1 (yarışma güvenli). Migration: 021. */
export type ServiceDecrementTextCreditResult =
  | { ok: true; remaining: number }
  | {
      ok: false;
      kind: "rpc_error" | "unexpected_response" | "debit_rejected";
      message: string;
      code?: string;
      details?: string;
      hint?: string;
      rawData?: unknown;
      remaining?: number;
    };

export async function rpcServiceDecrementTextCredit(
  admin: SupabaseClient,
  userId: string,
): Promise<ServiceDecrementTextCreditResult> {
  const { data, error } = await admin.rpc("service_decrement_text_credit", {
    p_user_id: userId,
  });
  if (error) {
    const meta = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
    console.error(
      "[credits] service_decrement_text_credit RPC error:",
      JSON.stringify(meta),
    );
    return {
      ok: false,
      kind: "rpc_error",
      message: error.message,
      code: error.code,
      details: typeof error.details === "string" ? error.details : undefined,
      hint: typeof error.hint === "string" ? error.hint : undefined,
    };
  }

  const row = firstRow<ReserveRow>(data);
  if (!row || typeof row.ok !== "boolean") {
    console.error(
      "[credits] service_decrement_text_credit unexpected data:",
      JSON.stringify(data),
    );
    return {
      ok: false,
      kind: "unexpected_response",
      message: "RPC beklenmeyen yanıt (satır yok veya format hatalı).",
      rawData: data,
    };
  }

  const remaining =
    typeof row.remaining === "number" ? row.remaining : 0;

  if (!row.ok) {
    console.warn(
      "[credits] service_decrement_text_credit ok=false:",
      JSON.stringify({ remaining, userId }),
    );
    return {
      ok: false,
      kind: "debit_rejected",
      message:
        "Kredi satırı güncellenemedi (bakiye 0 veya satır yok).",
      remaining,
    };
  }

  return { ok: true, remaining };
}
