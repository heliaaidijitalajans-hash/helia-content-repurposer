"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/admin/config";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/dashboard");
        return;
      }

      setAllowed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Admin Panel
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Kullanıcılar, planlar ve kredi bakiyeleri (yalnızca yetkili hesap).
      </p>
      <AdminPanel />
    </div>
  );
}
