import Link from "next/link";
import { getDashboardHomePageCopy } from "@/lib/dashboard/load-copy";
import { getDashboardStatsPlaceholder } from "@/lib/dashboard/stats-placeholder";
import { lightCardClass } from "@/lib/ui/saas-card";

const statCardClass = `${lightCardClass} shadow-sm`;
const btnSecondary =
  "inline-flex w-full items-center justify-center rounded-xl border border-blue-200/80 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm shadow-blue-900/5 transition hover:border-blue-300 hover:bg-blue-50/90 hover:text-blue-800 sm:w-auto";

export default async function DashboardPage() {
  const copy = await getDashboardHomePageCopy();
  const stats = getDashboardStatsPlaceholder();
  const planLabel = stats.plan === "pro" ? copy.planPro : copy.planFree;

  const statItems = [
    {
      label: copy.statCreditsRemainingLabel,
      value: stats.creditsRemaining,
      hint: copy.statCreditsRemainingHint,
      numeric: true,
    },
    {
      label: copy.statCreditsUsedLabel,
      value: stats.creditsUsed,
      hint: copy.statCreditsUsedHint,
      numeric: true,
    },
    {
      label: copy.statTotalOutputLabel,
      value: stats.totalOutput,
      hint: copy.statTotalOutputHint,
      numeric: true,
    },
    {
      label: copy.statPlanLabel,
      value: planLabel,
      hint: copy.statPlanHint,
      numeric: false,
    },
  ] as const;

  const quickActions = [
    { label: copy.quickTextToViral, href: "/generate" as const },
    { label: copy.quickUploadVideo, href: "/generate" as const },
    { label: copy.quickViewHistory, href: "/history" as const },
  ] as const;

  const activities = [copy.activity1, copy.activity2, copy.activity3] as const;

  return (
    <div className="mx-auto max-w-[1100px] space-y-10 px-0">
      <header className="flex flex-col gap-6 border-b border-blue-200/50 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {copy.subtitle}
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {copy.headerCreateCta}
        </Link>
      </header>

      <section aria-label={copy.statPlanLabel}>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item) => (
            <li key={item.label}>
              <div className={`${statCardClass} flex h-full flex-col justify-between`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p
                  className={`mt-3 font-semibold tracking-tight text-slate-900 ${
                    item.numeric ? "text-3xl tabular-nums" : "text-2xl"
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-2 text-xs text-slate-500">{item.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dashboard-quick-title">
        <h2
          id="dashboard-quick-title"
          className="text-lg font-semibold text-slate-900"
        >
          {copy.quickTitle}
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {quickActions.map(({ label, href }) => (
            <Link key={label} href={href} className={btnSecondary}>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="dashboard-activity-title">
        <h2
          id="dashboard-activity-title"
          className="text-lg font-semibold text-slate-900"
        >
          {copy.activityTitle}
        </h2>
        <ul className="mt-4 divide-y divide-blue-100/80 rounded-xl border border-blue-200/70 bg-white/95 shadow-md shadow-blue-900/10 ring-1 ring-blue-100/40 backdrop-blur-sm">
          {activities.map((text) => (
            <li
              key={text}
              className="flex items-center gap-3 px-4 py-3.5 text-sm text-slate-800 first:rounded-t-xl last:rounded-b-xl"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                aria-hidden
              />
              {text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
