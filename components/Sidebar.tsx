"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { lightCardClass } from "@/lib/ui/saas-card";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact: boolean;
};

function buildNavItems(showAdminLink: boolean): NavItem[] {
  const base: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: IconHome, exact: true },
    {
      href: "/generate",
      label: "Content Generator",
      icon: IconSpark,
      exact: false,
    },
    { href: "/history", label: "History", icon: IconClock, exact: false },
    { href: "/account", label: "Account", icon: IconGear, exact: false },
  ];
  if (showAdminLink) {
    base.push({
      href: "/admin",
      label: "Admin",
      icon: IconShield,
      exact: true,
    });
  }
  base.push({
    href: "/support",
    label: "Support",
    icon: IconLifebuoy,
    exact: false,
  });
  return base;
}

function isNavActive(
  pathname: string,
  href: string,
  exact: boolean | undefined,
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarProps = {
  mobileOpen: boolean;
  onNavigate?: () => void;
  showAdminLink?: boolean;
};

export function Sidebar({
  mobileOpen,
  onNavigate,
  showAdminLink = false,
}: SidebarProps) {
  const pathname = usePathname();
  const items = buildNavItems(showAdminLink);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-blue-950/35 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
        onClick={onNavigate}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r border-blue-200/70 bg-gradient-to-b from-white/95 to-blue-50/50 pt-14 shadow-xl shadow-blue-900/10 backdrop-blur-md transition-transform duration-200 ease-out md:static md:z-0 md:translate-x-0 md:pt-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : ""
        }`}
        aria-label="Workspace"
      >
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {items.map(({ href, label, icon: Icon, exact }: NavItem) => {
            const active = isNavActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-blue-100/80 text-blue-700 shadow-md shadow-blue-900/10 ring-1 ring-blue-200/80"
                    : "text-slate-800 hover:bg-blue-100/40 hover:text-blue-700"
                } `}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    active
                      ? "text-blue-600"
                      : "text-gray-500 group-hover:text-blue-600"
                  }`}
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-blue-100/80 p-3">
          <div className={lightCardClass}>
            <p className="text-xs font-medium text-gray-900">Helia AI</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">
              Pro workspace
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function IconHome(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconSpark(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

function IconClock(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconGear(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l1.284 7.48c.03.173.128.326.273.418.937.533 1.762 1.223 2.434 2.032a.75.75 0 0 1-.03 1.002l-1.814 1.974a.75.75 0 0 1-1.034.016 8.97 8.97 0 0 1-2.56-2.91c-.18-.376-.59-.61-1.05-.61h-1.47c-.46 0-.87.234-1.05.61a8.97 8.97 0 0 1-2.56 2.91.75.75 0 0 1-1.034-.016L5.15 15.052a.75.75 0 0 1-.03-1.002c.672-.809 1.497-1.499 2.434-2.032.145-.092.243-.245.273-.418l1.284-7.48Z" />
    </svg>
  );
}

function IconLifebuoy(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.03 9.03 0 0 1 1.652 1.306c.51.51.958 1.074 1.335 1.672M16.712 4.33c-1.124-.93-2.346-1.688-3.636-2.25M16.712 4.33l-2.116 5.307M4.5 19.5c1.65 2.385 4.3 4.046 7.317 4.5M4.5 19.5 2.25 17.25m2.25 2.25 2.307-5.758M19.5 4.5c1.65 2.385 2.692 5.25 2.85 8.25m-2.85-8.25L17.25 9.75m0 0-2.116-5.307M9.75 9.75 2.25 12m0 0 5.243-2.243M9.75 9.75 9.75 15.75m6-6c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3Z" />
    </svg>
  );
}

function IconShield(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Zm0 13.5h.008v.008H9v-.008Z" />
    </svg>
  );
}
