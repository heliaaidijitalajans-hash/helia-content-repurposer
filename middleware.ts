import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import {
  localeFromPathname,
  parseStandaloneLocale,
  STANDALONE_LOCALE_COOKIE,
} from "@/lib/i18n/standalone-locale";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

/** Standalone sayfalarda RSC / root layout `headers()` ile dil alsın diye isteğe locale yazar. */
function nextWithStandaloneLocaleOnRequest(request: NextRequest) {
  const raw = request.cookies.get(STANDALONE_LOCALE_COOKIE)?.value;
  const locale = parseStandaloneLocale(raw);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-intl-locale", locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // All App Router API routes live under `app/api/**` (not `app/[locale]`).
  // Skip next-intl so nothing gets a `/tr` or `/en` prefix.
  if (pathname.startsWith("/api/") || pathname === "/api") {
    // Inngest: signing only — no Supabase cookie handling.
    if (pathname === "/api/inngest" || pathname.startsWith("/api/inngest/")) {
      return NextResponse.next();
    }
    return await updateSession(
      request,
      nextWithStandaloneLocaleOnRequest(request),
    );
  }

  // Standalone SaaS shell (no locale prefix) — login redirect, dashboard, generate, …
  if (
    pathname === "/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
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
    pathname.startsWith("/support/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/")
  ) {
    return await updateSession(
      request,
      nextWithStandaloneLocaleOnRequest(request),
    );
  }

  const response = handleI18n(request);
  const res = await updateSession(request, response);
  const fromPath = localeFromPathname(pathname);
  if (fromPath) {
    res.cookies.set(STANDALONE_LOCALE_COOKIE, fromPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  matcher: [
    // Pages + locale routes; `api` excluded here so i18n does not treat `/api/*` as localized.
    "/((?!api|_next|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/:path*",
  ],
};
