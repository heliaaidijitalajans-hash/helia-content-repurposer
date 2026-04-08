import { getTranslations } from "next-intl/server";
import { saasCardClass } from "@/lib/ui/saas-card";

const cards = [
  {
    titleKey: "featuresCardVideoTitle" as const,
    descKey: "featuresCardVideoDesc" as const,
    iconWrap: "bg-sky-500/15 text-sky-300 ring-sky-400/25",
    Icon: IconFilm,
  },
  {
    titleKey: "featuresCardViralTitle" as const,
    descKey: "featuresCardViralDesc" as const,
    iconWrap: "bg-violet-500/15 text-violet-300 ring-violet-400/25",
    Icon: IconSpark,
  },
  {
    titleKey: "featuresCardThreadTitle" as const,
    descKey: "featuresCardThreadDesc" as const,
    iconWrap: "bg-blue-500/15 text-blue-300 ring-blue-400/25",
    Icon: IconThread,
  },
  {
    titleKey: "featuresCardCarouselTitle" as const,
    descKey: "featuresCardCarouselDesc" as const,
    iconWrap: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
    Icon: IconCarousel,
  },
  {
    titleKey: "featuresCardHooksTitle" as const,
    descKey: "featuresCardHooksDesc" as const,
    iconWrap: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
    Icon: IconHooks,
  },
];

export default async function FeaturesPage() {
  const t = await getTranslations("marketingPages");

  return (
    <div className="notranslate min-h-screen text-slate-100">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t("featuresHeroTitle")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            {t("featuresHeroSub")}
          </p>
        </header>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {cards.map(({ titleKey, descKey, iconWrap, Icon }) => (
            <li
              key={titleKey}
              className={`group flex flex-col ${saasCardClass}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition group-hover:scale-105 ${iconWrap}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">
                {t(titleKey)}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
                {t(descKey)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function IconFilm(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function IconSpark(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM16.23 7.75h.008v.008h-.008V7.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function IconThread(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 4.5h12M3.75 6.75h.008v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.008v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 4.5h.008v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function IconCarousel(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  );
}

function IconHooks(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.375m0-16.875a3 3 0 0 1-3 3v1.5m6 0a3 3 0 0 0-3-3v-1.5m0 0V9.75m0 1.5h-.375a9.015 9.015 0 0 0-6.627 2.292m10.752-2.292H12m0 0h-.008H12Z" />
    </svg>
  );
}
