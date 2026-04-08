"use client";

import NextLink from "next/link";

type Props = {
  href: string;
  className: string;
  children: React.ReactNode;
};

/** Pricing CTA → /checkout with optional ?plan=; logs click for debugging. */
export function PricingCheckoutLink({ href, className, children }: Props) {
  return (
    <NextLink
      href={href}
      className={className}
      onClick={() => {
        console.log("[pricing] Navigate to checkout:", href);
      }}
    >
      {children}
    </NextLink>
  );
}
