import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  // Sunucuda doğrulanmış kullanıcı (JWT); oturum çerezlerinden gelir — getSession() yerine getUser() tercih edilir.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader email={user.email ?? ""} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Repurpose content
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Turn one draft into social-ready formats.{" "}
            <Link
              href="/"
              className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              Back to home
            </Link>
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
