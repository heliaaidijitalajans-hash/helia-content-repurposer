"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { HistoryPageCopy } from "@/lib/history/load-copy";
import type { HistoryItem } from "@/lib/history/types";

function itemTitle(template: string, number: number) {
  return template.replace("{number}", String(number));
}

export function HistoryList({
  items,
  copy,
}: {
  items: HistoryItem[];
  copy: HistoryPageCopy;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const onCopy = useCallback(async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.fullText);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 2000);
    } catch {
      window.alert(copy.copyError);
    }
  }, [copy.copyError]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-16 text-center">
        <p className="text-base font-medium text-gray-900">{copy.emptyTitle}</p>
        <Link
          href="/dashboard/content"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {copy.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const typeLabel =
          item.type === "thread" ? copy.typeThread : copy.typeCarousel;
        return (
          <li key={item.id}>
            <article className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-gray-900">
                    {itemTitle(copy.itemTitle, item.number)}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span className="font-medium text-blue-600">{typeLabel}</span>
                    <span aria-hidden className="text-gray-300">
                      ·
                    </span>
                    <span>{copy.dateToday}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {item.preview}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <Link
                    href="/dashboard/content"
                    className="inline-flex justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 sm:min-w-[7.5rem]"
                  >
                    {copy.view}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onCopy(item)}
                    className="inline-flex justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:min-w-[7.5rem]"
                  >
                    {copiedId === item.id ? copy.copyDone : copy.copy}
                  </button>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
