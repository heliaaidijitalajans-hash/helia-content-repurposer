"use client";

import { useId } from "react";
import NextLink from "next/link";

/** Shared link chrome: flex, hover scale + blue glow */
export const heliaLogoLinkClass =
  "group flex items-center gap-2.5 rounded-lg p-1 -ml-1 outline-none transition duration-200 hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2";

const wordmarkClass =
  "truncate text-base font-semibold tracking-tight text-gray-900 transition group-hover:text-gray-950";

/** Gradient geometric mark: hex frame + spiral arc, hollow center. */
export function HeliaLogoMark({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, "");
  const gradId = `helia-logo-grad-${gid}`;

  return (
    <div
      className={`relative h-8 w-8 shrink-0 rotate-[-11deg] transition-transform duration-500 ease-out group-hover:rotate-0 ${className ?? ""}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full overflow-visible transition-[filter] duration-200 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="4"
            y1="6"
            x2="28"
            y2="26"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3b82f6" />
            <stop offset="0.5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <g>
          {/* Outer rounded hex frame — stroke leaves visual void in center */}
          <path
            d="M16 4.5 L26.2 10.4 L26.2 21.6 L16 27.5 L5.8 21.6 L5.8 10.4 Z"
            stroke={`url(#${gradId})`}
            strokeWidth="2.35"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          {/* Inner echo hex — spiral / depth */}
          <path
            d="M16 9.2 L22.4 12.9 L22.4 19.1 L16 22.8 L9.6 19.1 L9.6 12.9 Z"
            stroke={`url(#${gradId})`}
            strokeWidth="1.35"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />
          {/* Open spiral arc — processing motion */}
          <path
            d="M 20.5 11.5 C 18 9.2 14.2 9.8 12.4 12.6 C 10.8 15.2 11.6 18.6 14.2 20.4 C 16.5 22 19.8 21.4 21.5 19"
            stroke={`url(#${gradId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}

export function HeliaLogoWordmark() {
  return <span className={wordmarkClass}>Helia AI</span>;
}

type HeliaLogoNextProps = {
  href?: string;
  className?: string;
};

/** App shell: next/link → default home `/` */
export function HeliaLogoNext({ href = "/", className }: HeliaLogoNextProps) {
  return (
    <NextLink
      href={href}
      className={`${heliaLogoLinkClass} ${className ?? ""}`}
      aria-label="Helia AI home"
    >
      <HeliaLogoMark />
      <HeliaLogoWordmark />
    </NextLink>
  );
}
