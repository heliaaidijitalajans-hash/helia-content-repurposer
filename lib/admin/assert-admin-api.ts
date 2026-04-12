import { createClient } from "@/lib/supabase/server";
import { requireAdminGateOrPass } from "./admin-gate";
import { isAdminEmail } from "./config";

export type AdminAuthOk = { ok: true; userId: string; email: string };
export type AdminAuthFail = { ok: false; response: Response };

/**
 * Oturum + admin e-postası. Kapı çerezi gerekmez (unlock, gate durumu, session doğrulama).
 */
export async function assertAdminEmailOnly(): Promise<AdminAuthOk | AdminAuthFail> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      ok: false,
      response: new Response("Unauthorized", { status: 401 }),
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      ok: false,
      response: new Response("Unauthorized", { status: 403 }),
    };
  }

  return { ok: true, userId: user.id, email: user.email };
}

/**
 * Veri API’leri: admin e-postası + HELIA_ADMIN_PANEL_PASSWORD tanımlıysa geçerli kapı çerezi.
 */
export async function assertAdminApi(): Promise<AdminAuthOk | AdminAuthFail> {
  const auth = await assertAdminEmailOnly();
  if (!auth.ok) return auth;
  const gate = await requireAdminGateOrPass(auth.userId);
  if (!gate.ok) return { ok: false, response: gate.response };
  return auth;
}
