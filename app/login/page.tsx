import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

/**
 * Oturum yokken yönlendirme hedefi. Asıl form: /[locale]/auth
 */
export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";
  redirect(
    `/${routing.defaultLocale}/auth?next=${encodeURIComponent(safeNext)}`,
  );
}
