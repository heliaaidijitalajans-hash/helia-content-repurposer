"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-100">
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <div className="flex md:min-h-[calc(100vh-3.5rem)]">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
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
