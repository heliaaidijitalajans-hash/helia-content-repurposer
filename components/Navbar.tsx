"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeliaLogoNext } from "@/components/brand/helia-logo";

type NavbarProps = {
  onMenuClick?: () => void;
  showAdminLink?: boolean;
};

export function Navbar({ onMenuClick, showAdminLink = false }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const linkClass =
    "rounded-lg px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-100/50 hover:text-blue-700";

  return (
    <header className="sticky top-0 z-50 border-b border-blue-200/60 bg-white/80 text-slate-900 shadow-sm shadow-blue-900/5 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick ? (
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:hidden"
              onClick={onMenuClick}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                />
              </svg>
            </button>
          ) : null}
          <HeliaLogoNext href="/" />
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <nav
            className="hidden items-center sm:flex"
            aria-label="Main"
          >
            <Link href="/dashboard" className={linkClass}>
              Dashboard
            </Link>
            <Link href="/account" className={linkClass}>
              Hesabım
            </Link>
            {showAdminLink ? (
              <Link href="/admin" className={linkClass}>
                Admin
              </Link>
            ) : null}
            <Link href="/support" className={linkClass}>
              Support
            </Link>
          </nav>

          <div className="relative pl-1 sm:pl-2" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white shadow-md ring-2 ring-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Profile menu"
            >
              JD
            </button>
            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-blue-200/80 bg-white/95 py-1 shadow-lg shadow-blue-900/10 backdrop-blur-md"
              >
                <Link
                  href="/account"
                  className="block px-4 py-2.5 text-sm text-gray-800 transition hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  Account settings
                </Link>
                {showAdminLink ? (
                  <Link
                    href="/admin"
                    className="block px-4 py-2.5 text-sm text-gray-800 transition hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Admin panel
                  </Link>
                ) : null}
                <Link
                  href="/support"
                  className="block px-4 py-2.5 text-sm text-gray-800 transition hover:bg-gray-50"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  Help &amp; support
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                  onClick={() => setProfileOpen(false)}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
