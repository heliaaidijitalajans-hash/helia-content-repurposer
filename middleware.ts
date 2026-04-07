import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inngest: no locale prefix, no Supabase session — signing is handled in /api/inngest.
  if (pathname === "/api/inngest" || pathname.startsWith("/api/inngest/")) {
    return NextResponse.next();
  }

  const response = handleI18n(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    // Pages + locale routes only; other /api/* stays out unless listed below.
    "/((?!api|_next|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/inngest",
    "/api/inngest/:path*",
  ],
};
