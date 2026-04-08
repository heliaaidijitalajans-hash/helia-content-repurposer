"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { lightCardClass } from "@/lib/ui/saas-card";

const SUPPORT_EMAIL = "helia.destek@gmail.com";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClass = "text-sm font-medium text-gray-900";

export function SupportContactForm() {
  const t = useTranslations("supportPage");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = encodeURIComponent(t("formMailSubject"));
    const body = encodeURIComponent(
      `${t("formEmailLabel")}: ${email.trim()}\n\n${t("formMessageLabel")}:\n${message.trim()}`,
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${lightCardClass} space-y-5`}
      noValidate={false}
    >
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">
        {t("formTitle")}
      </h2>
      <div>
        <label htmlFor="support-email" className={labelClass}>
          {t("formEmailLabel")}
        </label>
        <input
          id="support-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="support-message" className={labelClass}>
          {t("formMessageLabel")}
        </label>
        <textarea
          id="support-message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-y min-h-[120px]`}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto sm:px-6"
      >
        {t("formSubmit")}
      </button>
    </form>
  );
}
