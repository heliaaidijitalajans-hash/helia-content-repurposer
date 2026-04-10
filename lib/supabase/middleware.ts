import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isStandaloneProtectedPath } from "@/lib/auth/protected-paths";
import { routing } from "@/i18n/routing";
import { getPublicSupabaseConfig } from "./config";

function copySetCookies(from: NextResponse, to: NextResponse) {
  from.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      to.headers.append(key, value);
    }
  });
}

export async function updateSession(
  request: NextRequest,
  initialResponse?: NextResponse,
) {
  const { url, anonKey, isConfigured } = getPublicSupabaseConfig();
  if (!isConfigured) {
    return initialResponse ?? NextResponse.next({ request });
  }

  const supabaseResponse = initialResponse ?? NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === "/login") {
    return supabaseResponse;
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const locale = routing.locales.includes(firstSegment as "tr" | "en")
    ? firstSegment
    : null;

  if (locale === null && isStandaloneProtectedPath(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    const nextTarget =
      pathname + (request.nextUrl.search || "");
    redirectUrl.searchParams.set("next", nextTarget || "/dashboard");
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copySetCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  const isDashboardRoute = locale !== null && segments[1] === "dashboard";

  if (isDashboardRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/auth`;
    redirectUrl.searchParams.set("next", "/dashboard");
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copySetCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
