import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Legacy URL; full policy lives at /privacy-policy. */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/privacy-policy`);
}
