"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type CheckoutPlanKey = "free" | "monthly" | "pro" | "yearly";

type PlanDetails = {
  name: string;
  price: string;
  video: string;
  text: string;
};

const PLANS: Record<CheckoutPlanKey, PlanDetails> = {
  free: {
    name: "Ücretsiz",
    price: "0 TL",
    video: "30 dk video",
    text: "3 metin",
  },
  monthly: {
    name: "Aylık Plan",
    price: "300 TL / ay",
    video: "200 dk video",
    text: "40 metin",
  },
  pro: {
    name: "Pro Plan",
    price: "420 TL / ay",
    video: "300 dk video",
    text: "55 metin",
  },
  yearly: {
    name: "Yıllık Plan",
    price: "2500 TL / yıl",
    video: "3000 dk video",
    text: "550 metin",
  },
};

function normalizePlanKey(raw: string | undefined): CheckoutPlanKey {
  if (raw === "free" || raw === "monthly" || raw === "pro" || raw === "yearly") {
    return raw;
  }
  return "pro";
}

type LegalLinks = {
  terms: string;
  distanceSales: string;
  privacy: string;
  refund: string;
};

type Props = {
  email: string;
  planKey: string | undefined;
  legal: LegalLinks;
};

export function CheckoutDemoForm({ email, planKey, legal }: Props) {
  const router = useRouter();
  const plan = useMemo(
    () => PLANS[normalizePlanKey(planKey)],
    [planKey],
  );

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeDistance, setAgreeDistance] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const allLegalChecked =
    agreeTerms && agreeDistance && agreePrivacy && agreeRefund;

  const canSubmit = allLegalChecked;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/apply-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: normalizePlanKey(planKey) }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setSubmitError(
          typeof data.error === "string" ? data.error : "İstek başarısız",
        );
        return;
      }
      setToast("Plan kaydedildi. Yönlendiriliyorsunuz…");
      router.refresh();
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch {
      setSubmitError("Ağ hatası. Tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  const linkClass =
    "font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700";

  return (
    <div className="notranslate mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Ödeme
      </h1>
      <p className="mt-1 text-sm text-gray-500">Powered by AI ⚡</p>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Seçilen Plan</h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-gray-500">Plan</dt>
              <dd className="font-semibold text-gray-900">{plan.name}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-gray-500">Fiyat</dt>
              <dd className="font-semibold text-gray-900">{plan.price}</dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              {plan.video}
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              {plan.text}
            </li>
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            Abonelik otomatik yenilenir
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Hesap</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">E-posta</dt>
              <dd className="mt-1">
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 outline-none"
                />
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Plan adı</dt>
              <dd className="mt-1 font-semibold text-gray-900">{plan.name}</dd>
            </div>
          </dl>
        </section>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">
              Ödeme Bilgileri
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <label className="block text-sm font-medium text-gray-700">
                Kart Numarası
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-2"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Son Kullanma
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="AA / YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-2"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  CVC
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-2"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="sr-only">Yasal onaylar</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <input
                  id="legal-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 size-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="legal-terms" className="leading-relaxed">
                  <NextLink href={legal.terms} className={linkClass}>
                    Kullanım Şartları
                  </NextLink>
                  &apos;nı okudum ve kabul ediyorum
                </label>
              </li>
              <li className="flex gap-3">
                <input
                  id="legal-distance"
                  type="checkbox"
                  checked={agreeDistance}
                  onChange={(e) => setAgreeDistance(e.target.checked)}
                  className="mt-1 size-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="legal-distance" className="leading-relaxed">
                  <NextLink href={legal.distanceSales} className={linkClass}>
                    Mesafeli Satış Sözleşmesi
                  </NextLink>
                  &apos;ni kabul ediyorum
                </label>
              </li>
              <li className="flex gap-3">
                <input
                  id="legal-privacy"
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-1 size-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="legal-privacy" className="leading-relaxed">
                  <NextLink href={legal.privacy} className={linkClass}>
                    Gizlilik Politikası
                  </NextLink>
                  &apos;nı okudum
                </label>
              </li>
              <li className="flex gap-3">
                <input
                  id="legal-refund"
                  type="checkbox"
                  checked={agreeRefund}
                  onChange={(e) => setAgreeRefund(e.target.checked)}
                  className="mt-1 size-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="legal-refund" className="leading-relaxed">
                  <NextLink href={legal.refund} className={linkClass}>
                    İptal ve İade Politikası
                  </NextLink>
                  &apos;nı kabul ediyorum
                </label>
              </li>
            </ul>
          </section>

          {submitError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-base font-semibold text-white shadow-md transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {submitting ? "Kaydediliyor…" : "Ödemeyi Tamamla"}
          </button>

          <ul className="flex flex-col items-center gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              Güvenli ödeme
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              256-bit SSL
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              İstediğin zaman iptal
            </li>
          </ul>

          <p className="text-center text-xs leading-relaxed text-gray-500">
            Ödeme sonrası aboneliğiniz hemen aktif edilir ve otomatik yenilenir.
          </p>
        </form>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[240] max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-medium text-white shadow-xl"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
