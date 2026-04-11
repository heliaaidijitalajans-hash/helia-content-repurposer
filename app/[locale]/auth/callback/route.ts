import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { ensureAppUserAfterAuth } from "@/lib/users/ensure-app-user";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

/**
 * OAuth PKCE + oturum çerezleri istekle gelir; `exchangeCodeForSession` sonrası
 * çerezler mutlaka dönüş `NextResponse` üzerine yazılmalı (sadece `cookies().set`
 * kullanımı yönlendirmede tarayıcıya gitmeyebilir). Yönlendirme host'u da
 * callback'i açan origin ile aynı olmalı (www / apex uyumu).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const origin = request.nextUrl.origin;
  const { url, anonKey, isConfigured } = getPublicSupabaseConfig();

  const errorRedirect = `${origin}/${locale}/auth?error=auth`;

  if (!code || !isConfigured) {
    return NextResponse.redirect(errorRedirect);
  }

  const redirectTarget = new URL(next, origin).toString();
  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          if (typeof value === "string") {
            response.headers.set(key, value);
          }
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession:", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  try {
    await ensureAppUserAfterAuth(supabase);
  } catch (e) {
    console.error("[auth/callback] ensureAppUserAfterAuth:", e);
  }

  return response;
}
