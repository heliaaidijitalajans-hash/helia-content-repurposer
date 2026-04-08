import { HistoryList } from "@/components/history/history-list";
import { getHistoryItems } from "@/lib/history/get-history-items";
import { getHistoryPageCopy } from "@/lib/history/load-copy";

export default async function HistoryPage() {
  const copy = await getHistoryPageCopy();
  const items = getHistoryItems();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
          {copy.subtitle}
        </p>
      </header>

      <HistoryList items={items} copy={copy} />
    </div>
  );
}
