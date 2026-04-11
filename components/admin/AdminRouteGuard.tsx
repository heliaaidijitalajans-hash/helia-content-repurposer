"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * İstemci tarafı kontrol: sunucu ile aynı admin kuralı (HELIA_ADMIN_EMAIL dahil).
 * Örnek desen (getUser + e-posta) yerine /api/admin/session — env uyumu için.
 */
export function AdminRouteGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/session", { credentials: "include" });
      if (cancelled) return;
      if (!res.ok) {
        router.replace("/dashboard");
        return;
      }
      setAllowed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (allowed !== true) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Yükleniyor…
      </p>
    );
  }

  return <>{children}</>;
}
