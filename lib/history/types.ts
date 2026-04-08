export type HistoryContentType = "thread" | "carousel";

export type HistoryItem = {
  id: string;
  /** 1-based display number for the title */
  number: number;
  type: HistoryContentType;
  preview: string;
  /** Full text used when copying */
  fullText: string;
};
