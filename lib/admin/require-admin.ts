import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { syncUserAndCredits } from "@/lib/users/sync-user-and-credits";
import { isAdminEmail } from "./config";

/** Oturum yoksa /login; admin değilse /dashboard. */
export async function requireAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  await syncUserAndCredits(supabase);

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return user;
}
