import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Legacy URL; full policy lives at /cookie-policy. */
export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/cookie-policy`);
}
