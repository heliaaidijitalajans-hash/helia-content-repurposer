import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // All App Router API routes live under `app/api/**` (not `app/[locale]`).
  // Skip next-intl so nothing gets a `/tr` or `/en` prefix.
  if (pathname.startsWith("/api/") || pathname === "/api") {
    // Inngest: signing only — no Supabase cookie handling.
    if (pathname === "/api/inngest" || pathname.startsWith("/api/inngest/")) {
      return NextResponse.next();
    }
    return await updateSession(request, NextResponse.next());
  }

  // Standalone SaaS shell (no locale prefix) — dashboard, generate, account, history, settings, support
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/history" ||
    pathname.startsWith("/history/") ||
    pathname === "/generate" ||
    pathname.startsWith("/generate/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/support" ||
    pathname.startsWith("/support/")
  ) {
    return await updateSession(request, NextResponse.next());
  }

  const response = handleI18n(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    // Pages + locale routes; `api` excluded here so i18n does not treat `/api/*` as localized.
    "/((?!api|_next|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/:path*",
  ],
};
