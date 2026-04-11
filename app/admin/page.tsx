import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";

export default function AdminPage() {
  return (
    <AdminRouteGuard>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Admin paneli
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Kullanıcılar, planlar ve kredi bakiyeleri (yalnızca yetkili hesap).
        </p>
        <AdminPanel />
      </div>
    </AdminRouteGuard>
  );
}
