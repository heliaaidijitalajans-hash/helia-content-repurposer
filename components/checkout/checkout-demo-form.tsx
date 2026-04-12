"use client";

import type en from "@/messages/en.json";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type CheckoutPlanKey = "free" | "monthly" | "pro" | "yearly";

export type CheckoutPageCopy = (typeof en)["checkoutPage"];

type PlanDetails = {
  name: string;
  price: string;
  video: string;
  text: string;
};

function planFromCopy(
  copy: CheckoutPageCopy,
  key: CheckoutPlanKey,
): PlanDetails {
  switch (key) {
    case "free":
      return {
        name: copy.planFreeName,
        price: copy.planFreePrice,
        video: copy.planFreeVideo,
        text: copy.planFreeText,
      };
    case "monthly":
      return {
        name: copy.planMonthlyName,
        price: copy.planMonthlyPrice,
        video: copy.planMonthlyVideo,
        text: copy.planMonthlyText,
      };
    case "yearly":
      return {
        name: copy.planYearlyName,
        price: copy.planYearlyPrice,
        video: copy.planYearlyVideo,
        text: copy.planYearlyText,
      };
    default:
      return {
        name: copy.planProName,
        price: copy.planProPrice,
        video: copy.planProVideo,
        text: copy.planProText,
      };
  }
}

function normalizePlanKey(raw: string | undefined): CheckoutPlanKey {
  if (
    raw === "free" ||
    raw === "monthly" ||
    raw === "pro" ||
    raw === "yearly"
  ) {
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
  copy: CheckoutPageCopy;
  email: string;
  planKey: string | undefined;
  legal: LegalLinks;
};

export function CheckoutDemoForm({ copy, email, planKey, legal }: Props) {
  const router = useRouter();
  const normalized = useMemo(
    () => normalizePlanKey(planKey),
    [planKey],
  );
  const plan = useMemo(
    () => planFromCopy(copy, normalized),
    [copy, normalized],
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
          typeof data.error === "string" ? data.error : copy.errorRequest,
        );
        return;
      }
      setToast(copy.toastPlanSaved);
      router.refresh();
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch {
      setSubmitError(copy.errorNetwork);
    } finally {
      setSubmitting(false);
    }
  }

  const linkClass =
    "font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700";

  return (
    <div className="notranslate mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {copy.title}
      </h1>
      <p className="mt-1 text-sm text-gray-500">{copy.tagline}</p>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">
            {copy.selectedPlanTitle}
          </h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-gray-500">{copy.labelPlan}</dt>
              <dd className="font-semibold text-gray-900">{plan.name}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-gray-500">{copy.labelPrice}</dt>
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
          <p className="mt-4 text-xs text-gray-500">{copy.renewNote}</p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">
            {copy.accountTitle}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">{copy.emailLabel}</dt>
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
              <dt className="text-gray-500">{copy.planNameLabel}</dt>
              <dd className="mt-1 font-semibold text-gray-900">{plan.name}</dd>
            </div>
          </dl>
        </section>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">
              {copy.paymentTitle}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <label className="block text-sm font-medium text-gray-700">
                {copy.cardNumberLabel}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={copy.cardNumberPlaceholder}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-2"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  {copy.expiryLabel}
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder={copy.expiryPlaceholder}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-2"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  {copy.cvcLabel}
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={copy.cvcPlaceholder}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-2"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="sr-only">{copy.legalSectionSr}</h2>
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
                  {copy.termsBefore}
                  <NextLink href={legal.terms} className={linkClass}>
                    {copy.termsLink}
                  </NextLink>
                  {copy.termsAfter}
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
                  {copy.distanceBefore}
                  <NextLink href={legal.distanceSales} className={linkClass}>
                    {copy.distanceLink}
                  </NextLink>
                  {copy.distanceAfter}
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
                  {copy.privacyBefore}
                  <NextLink href={legal.privacy} className={linkClass}>
                    {copy.privacyLink}
                  </NextLink>
                  {copy.privacyAfter}
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
                  {copy.refundBefore}
                  <NextLink href={legal.refund} className={linkClass}>
                    {copy.refundLink}
                  </NextLink>
                  {copy.refundAfter}
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
            {submitting ? copy.submitSubmitting : copy.submitIdle}
          </button>

          <ul className="flex flex-col items-center gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              {copy.trustSecure}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              {copy.trustSsl}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500" aria-hidden>
                ✓
              </span>
              {copy.trustCancel}
            </li>
          </ul>

          <p className="text-center text-xs leading-relaxed text-gray-500">
            {copy.footerNote}
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
