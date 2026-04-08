import Link from "next/link";
import { lightCardClass } from "@/lib/ui/saas-card";

const cards = [
  {
    title: "Generate Content",
    description: "Turn ideas into threads, carousels, and hooks in one flow.",
    href: "/dashboard/content",
    accent: "from-violet-500 to-indigo-600",
    icon: IconPen,
  },
  {
    title: "Video to Text",
    description: "Upload or link media and get clean transcripts fast.",
    href: "/dashboard/content",
    accent: "from-emerald-500 to-teal-600",
    icon: IconFilm,
  },
  {
    title: "Recent Outputs",
    description: "Pick up where you left off with your latest generations.",
    href: "/dashboard/history",
    accent: "from-amber-500 to-orange-600",
    icon: IconStack,
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
          Welcome back. Choose a workflow to create or revisit your content.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(
          ({ title, description, href, accent, icon: Icon }) => (
            <li key={title}>
              <Link
                href={href}
                className={`group relative flex h-full flex-col overflow-hidden transition hover:shadow-md ${lightCardClass}`}
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md transition group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
                  {description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 transition group-hover:gap-1">
                  Open
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function IconPen(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.129-1.897l8.932-8.931Z" />
    </svg>
  );
}

function IconFilm(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function IconStack(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m15.75-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
    </svg>
  );
}
