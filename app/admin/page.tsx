"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** İstemci: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (`createClient` içinde). */
const ADMIN_EMAIL = "helia.ai.digital.ajans@gmail.com";

function isAdminEmail(email: string | undefined): boolean {
  return (email?.trim().toLowerCase() ?? "") === ADMIN_EMAIL.toLowerCase();
}

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user) {
        router.push("/login?next=" + encodeURIComponent("/admin"));
        return;
      }

      if (!isAdminEmail(user.email ?? undefined)) {
        router.push("/dashboard");
        return;
      }

      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome admin</p>
    </div>
  );
}
