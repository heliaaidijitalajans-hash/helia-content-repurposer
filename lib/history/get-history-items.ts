import type { HistoryItem } from "./types";

/**
 * Returns saved generations. Replace with API / DB when available.
 * Return an empty array to show the empty state.
 */
export function getHistoryItems(): HistoryItem[] {
  return [
    {
      id: "1",
      number: 1,
      type: "thread",
      preview:
        "İçeriğini saniyeler içinde viral formata dönüştür. Video, ses veya metin — tek akışta thread, carousel ve hook üret.",
      fullText:
        "1/ İçeriğini saniyeler içinde viral formata dönüştür. 🚀\n\n2/ Video, ses veya metin — tek akışta thread, carousel ve hook.",
    },
    {
      id: "2",
      number: 2,
      type: "carousel",
      preview:
        "Slayt 1 — Dikkat: kaydırmayı bırakma.\nSlayt 2 — Tek tıkla paylaşıma hazır formatlar.",
      fullText:
        "Slayt 1 — Dikkat: kaydırmayı bırakma\nSlayt 2 — Tek tıkla paylaşıma hazır formatlar\nSlayt 3 — Helia AI ile üretildi",
    },
  ];
}
