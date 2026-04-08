import { CheckoutDemoForm } from "@/components/checkout/checkout-demo-form";
import { getStandaloneLocale } from "@/lib/account/load-copy";
import { requireSession } from "@/lib/standalone/require-session";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const sp = await searchParams;
  const plan = sp.plan;
  const query =
    typeof plan === "string" && plan.length > 0
      ? `?plan=${encodeURIComponent(plan)}`
      : "";
  await requireSession(`/checkout${query}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";

  const locale = await getStandaloneLocale();
  const legal = {
    terms: `/${locale}/terms`,
    distanceSales: `/${locale}/distance-sales`,
    privacy: `/${locale}/privacy-policy`,
    refund: `/${locale}/refund-policy`,
  };

  return (
    <CheckoutDemoForm email={email} planKey={sp.plan} legal={legal} />
  );
}
