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
      response: new Response("Unauthorized", { status: 401 }),
    };
  }

  // `user.email !== ADMIN_EMAIL` yerine: HELIA_ADMIN_EMAIL + trim/lowercase için isAdminEmail
  if (!isAdminEmail(user.email)) {
    return {
      ok: false,
      response: new Response("Unauthorized", { status: 403 }),
    };
  }

  return { ok: true, userId: user.id, email: user.email };
}
