"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
  /** Sunucu (`AppShell`) oturum e-postasına göre set eder; admin dışında görünmez. */
  showAdminLink?: boolean;
};

export function Layout({
  children,
  showAdminLink = false,
}: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar
        onMenuClick={() => setMobileNavOpen(true)}
        showAdminLink={showAdminLink}
      />
      <div className="flex md:min-h-[calc(100vh-3.5rem)]">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
          showAdminLink={showAdminLink}
        />
        <main className="min-w-0 flex-1 md:pl-0">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
