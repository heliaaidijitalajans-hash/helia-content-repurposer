"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AdminDirectLink } from "@/components/admin/AdminDirectLink";
import { AdminGateForm } from "@/components/admin/AdminGateForm";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin/config";

export default function AdminPage() {
  const t = useTranslations("adminPage");
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<User | null | undefined>(
    undefined,
  );
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessionUser === undefined) return;

    const t = window.setTimeout(() => {
      const user = sessionUser;

      if (!user) {
        setAllowed(false);
        router.push("/login?next=" + encodeURIComponent("/admin"));
        return;
      }

      if (!user.email || !isAdminEmail(user.email)) {
        setAllowed(false);
        router.push("/dashboard");
        return;
      }

      setAllowed(true);
    }, 100);

    return () => window.clearTimeout(t);
  }, [sessionUser, router]);

  if (sessionUser === undefined || !allowed) {
    return <div>{t("loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <AdminGateForm>
        <div className="space-y-8">
          <AdminDirectLink />
          <AdminPanel />
        </div>
      </AdminGateForm>
    </div>
  );
}
