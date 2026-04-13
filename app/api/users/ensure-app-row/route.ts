import { NextResponse } from "next/server";
import { upsertPublicUsersRowForAuthUser } from "@/lib/users/ensure-app-row-service";
import { createClient } from "@/lib/supabase/server";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Çerez oturumu doğrulanır; `public.users` satırı service role ile oluşturulur (RLS’den bağımsız).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      {
        error:
          "Server missing SUPABASE_SERVICE_ROLE_KEY — cannot ensure users row safely.",
      },
      { status: 503 },
    );
  }

  try {
    const row = await upsertPublicUsersRowForAuthUser(user);
    return NextResponse.json({ user: row });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[api/users/ensure-app-row]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
