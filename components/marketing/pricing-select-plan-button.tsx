"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useState } from "react";
import { apiOriginUrl } from "@/lib/api/origin-url";
import { HELIA_CREDITS_REFRESH_EVENT } from "@/lib/credits/constants";

export type PricingPlanApiKey = "free" | "monthly" | "pro" | "yearly";

type Props = {
  plan: PricingPlanApiKey;
  className: string;
  children: React.ReactNode;
};

export function PricingSelectPlanButton({ plan, className, children }: Props) {
  const t = useTranslations("marketingPages");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(apiOriginUrl("/api/select-plan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.status === 401) {
        showToast("error", t("pricingPageSelectPlanUnauthorized"));
        router.push("/auth");
        return;
      }

      if (!res.ok || !data.success) {
        showToast(
          "error",
          typeof data.error === "string"
            ? data.error
            : t("pricingPageSelectPlanError"),
        );
        return;
      }

      showToast("success", t("pricingPageSelectPlanSuccess"));
      window.dispatchEvent(new Event(HELIA_CREDITS_REFRESH_EVENT));
      router.refresh();
    } catch {
      showToast("error", t("pricingPageSelectPlanError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => void onClick()}
        className={`${className} ${loading ? "cursor-wait opacity-80" : ""}`}
      >
        {loading ? t("pricingPageSelectPlanLoading") : children}
      </button>
      {toast ? (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[300] max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-lg px-4 py-3 text-center text-sm font-medium shadow-xl ${
            toast.type === "success"
              ? "bg-emerald-900 text-white"
              : "bg-red-900 text-white"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </>
  );
}
