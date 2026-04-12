import { CheckoutDemoForm } from "@/components/checkout/checkout-demo-form";
import { getStandaloneLocale } from "@/lib/account/load-copy";
import { mergePlanPricesFromDb } from "@/lib/checkout/merge-plan-prices";
import { requireSession } from "@/lib/standalone/require-session";
import { createClient } from "@/lib/supabase/server";
import type en from "@/messages/en.json";

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
  const messages = (await import(
    `@/messages/${locale}.json`
  )) as { default: typeof en };
  const copyBase = messages.default.checkoutPage;
  let copy = copyBase;
  const { data: planPriceRows, error: planPriceErr } = await supabase
    .from("plans")
    .select("name, price_display_tr, price_display_en");
  if (!planPriceErr && planPriceRows?.length) {
    copy = mergePlanPricesFromDb(copyBase, planPriceRows, locale);
  }
  const legal = {
    terms: `/${locale}/terms`,
    distanceSales: `/${locale}/distance-sales`,
    privacy: `/${locale}/privacy-policy`,
    refund: `/${locale}/refund-policy`,
  };

  return (
    <CheckoutDemoForm
      copy={copy}
      email={email}
      planKey={sp.plan}
      legal={legal}
    />
  );
}
