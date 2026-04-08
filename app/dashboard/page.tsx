import Link from "next/link";
import { getHistoryItems } from "@/lib/history/get-history-items";
import { getDashboardHomePageCopy } from "@/lib/dashboard/load-copy";
import { getDashboardStatsPlaceholder } from "@/lib/dashboard/stats-placeholder";
import { lightCardClass } from "@/lib/ui/saas-card";

const cardBase = `${lightCardClass} shadow-sm transition hover:shadow-md`;

function itemTitle(template: string, number: number) {
  return template.replace("{number}", String(number));
}

export default async function DashboardPage() {
  const copy = await getDashboardHomePageCopy();
  const stats = getDashboardStatsPlaceholder();
  const historySlice = getHistoryItems().slice(0, 2);
  const dateLabels = [copy.dateToday, copy.dateYesterday] as const;
  const recentRows = historySlice.map((item, i) => ({
    ...item,
    dateLabel: dateLabels[i] ?? copy.dateToday,
  }));

  const quickCards = [
    {
      title: copy.quickCreateTitle,
      cta: copy.quickCreateCta,
      href: "/dashboard/content" as const,
      accent: "from-violet-500 to-indigo-600",
      Icon: IconPen,
    },
    {
      title: copy.quickVideoTitle,
      cta: copy.quickVideoCta,
      href: "/dashboard/content" as const,
      accent: "from-emerald-500 to-teal-600",
      Icon: IconFilm,
    },
    {
      title: copy.quickHistoryTitle,
      cta: copy.quickHistoryCta,
      href: "/history" as const,
      accent: "from-amber-500 to-orange-600",
      Icon: IconStack,
    },
  ] as const;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
          {copy.subtitle}
        </p>
      </header>

      <section aria-labelledby="dashboard-quick-heading">
        <h2
          id="dashboard-quick-heading"
          className="sr-only"
        >
          {copy.quickTitle}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickCards.map(({ title, cta, href, accent, Icon }) => (
            <li key={title}>
              <div
                className={`flex h-full flex-col ${cardBase}`}
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <div className="flex-1" />
                <Link
                  href={href}
                  className="mt-6 inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                >
                  {cta}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dashboard-recent-heading">
        <h2
          id="dashboard-recent-heading"
          className="text-base font-semibold text-gray-900"
        >
          {copy.recentTitle}
        </h2>
        <ul className="mt-4 space-y-3">
          {recentRows.map((item) => {
            const typeLabel =
              item.type === "thread" ? copy.typeThread : copy.typeCarousel;
            return (
              <li key={item.id}>
                <Link
                  href="/history"
                  className={`block ${cardBase}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {itemTitle(copy.itemTitle, item.number)}
                    </h3>
                    <span className="text-xs font-medium text-gray-500">
                      {item.dateLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {typeLabel}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {item.preview}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label={`${copy.statsTotalLabel}, ${copy.statsMonthLabel}`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
          <div className={cardBase}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {copy.statsTotalLabel}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
              {stats.total}
            </p>
          </div>
          <div className={cardBase}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {copy.statsMonthLabel}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
              {stats.thisMonth}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function IconPen(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.129-1.897l8.932-8.931Z"
      />
    </svg>
  );
}

function IconFilm(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

function IconStack(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m15.75-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
      />
    </svg>
  );
}
