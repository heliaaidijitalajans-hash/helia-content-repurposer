"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "helia.ai.digital.ajans@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  /** `undefined` = henüz oturum bilgisi gelmedi (INITIAL_SESSION / getSession bekleniyor) */
  const [sessionUser, setSessionUser] = useState<User | null | undefined>(
    undefined,
  );
  const [allowed, setAllowed] = useState(false);

  // Oturum: önce storage’dan getSession, sonra tüm güncellemeler onAuthStateChange ile
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

  // sessionUser yüklendikten sonra (null veya User) yönlendirme / izin
  useEffect(() => {
    if (sessionUser === undefined) return;

    const t = window.setTimeout(() => {
      const user = sessionUser;

      console.log("USER:", user);
      console.log("EMAIL:", user?.email);

      if (!user) {
        setAllowed(false);
        router.push("/login");
        return;
      }

      if (
        !user.email ||
        user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
      ) {
        setAllowed(false);
        router.push("/dashboard");
        return;
      }

      setAllowed(true);
    }, 100);

    return () => window.clearTimeout(t);
  }, [sessionUser, router]);

  if (sessionUser === undefined || !allowed) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome admin</p>
    </div>
  );
}
