import { redirect } from "next/navigation";
import { getStandaloneLocale } from "@/lib/account/load-copy";
import { createClient } from "@/lib/supabase/server";
import { syncAuthenticatedUserWithUsersTable } from "@/lib/users/sync-authenticated-user";

/** Redirects to locale auth with `next` when there is no session. */
export async function requireSession(nextPath: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getStandaloneLocale();
    redirect(
      `/${locale}/auth?next=${encodeURIComponent(nextPath)}`,
    );
  }

  await syncAuthenticatedUserWithUsersTable(supabase);
}
