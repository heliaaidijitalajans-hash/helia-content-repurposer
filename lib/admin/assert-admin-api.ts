import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "./config";

export type AdminAuthOk = { ok: true; userId: string; email: string };
export type AdminAuthFail = { ok: false; response: Response };

export async function assertAdminApi(): Promise<AdminAuthOk | AdminAuthFail> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      ok: false,
      response: Response.json({ error: "Giriş yapmalısın" }, { status: 401 }),
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      ok: false,
      response: Response.json({ error: "Yetkisiz" }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id, email: user.email };
}
