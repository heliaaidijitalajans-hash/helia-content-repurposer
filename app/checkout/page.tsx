import { CheckoutDemoForm } from "@/components/checkout/checkout-demo-form";
import { getStandaloneLocale } from "@/lib/account/load-copy";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const { plan } = await searchParams;
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
    <CheckoutDemoForm email={email} planKey={plan} legal={legal} />
  );
}
