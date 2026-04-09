"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useState } from "react";
import { apiOriginUrl } from "@/lib/api/origin-url";
import { HELIA_CREDITS_REFRESH_EVENT } from "@/lib/credits/constants";
import type { PlansTableName } from "@/lib/plans/normalize-plan-name";

type Props = {
  /** `public.plans.name`: free | aylık | pro | yearly */
  plan: PlansTableName;
  className: string;
  children: React.ReactNode;
};

type SelectPlanResponse = {
  success?: boolean;
  error?: string;
  plan?: string;
  credits?: { video?: number; text?: number };
};

export function PricingSelectPlanButton({ plan, className, children }: Props) {
  const t = useTranslations("marketingPages");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const showError = useCallback((message: string) => {
    window.alert(message);
  }, []);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = { planName: plan };
      const res = await fetch(apiOriginUrl("/api/select-plan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data: SelectPlanResponse;
      try {
        data = (await res.json()) as SelectPlanResponse;
      } catch {
        console.error("[pricing] /api/select-plan invalid JSON", res.status);
        showError(t("pricingPageSelectPlanError"));
        return;
      }

      console.log("[pricing] /api/select-plan response", {
        status: res.status,
        ok: res.ok,
        requestPlan: plan,
        body: data,
      });

      if (res.status === 401) {
        showError(t("pricingPageSelectPlanUnauthorized"));
        router.push("/auth");
        return;
      }

      if (!res.ok || !data.success) {
        const msg =
          typeof data.error === "string" && data.error.length > 0
            ? data.error
            : t("pricingPageSelectPlanError");
        showError(msg);
        return;
      }

      window.alert("Plan activated successfully");
      window.dispatchEvent(new Event(HELIA_CREDITS_REFRESH_EVENT));
      window.location.reload();
    } catch (e) {
      console.error("[pricing] /api/select-plan fetch failed", e);
      showError(t("pricingPageSelectPlanError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void onClick()}
      className={`${className} ${loading ? "cursor-wait opacity-80" : ""}`}
    >
      {loading ? t("pricingPageSelectPlanLoading") : children}
    </button>
  );
}
