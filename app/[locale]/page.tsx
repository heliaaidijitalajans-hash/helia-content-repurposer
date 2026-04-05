import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");

  const features = [
    {
      title: t("featureThreadsTitle"),
      body: t("featureThreadsBody"),
    },
    {
      title: t("featureCarouselsTitle"),
      body: t("featureCarouselsBody"),
    },
    {
      title: t("featureHooksTitle"),
      body: t("featureHooksBody"),
    },
  ];

  return (
    <div className="notranslate flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-6">
        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {tc("brand")}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link
            href="/auth"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {tn("logIn")}
          </Link>
          <Link
            href="/auth"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {tn("getStarted")}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-24 pt-12 md:pt-20">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl md:leading-[1.1]">
          {t("headline")}
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t("subhead")}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {t("startFree")}
          </Link>
          <Link
            href={{ pathname: "/auth", query: { next: "/dashboard" } }}
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200/80 px-6 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {t("openDashboard")}
          </Link>
        </div>

        <ul className="mt-20 grid gap-6 sm:grid-cols-3">
          {features.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-zinc-200/80 bg-white/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-zinc-200/80 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        {t("footer")}
      </footer>
    </div>
  );
}
