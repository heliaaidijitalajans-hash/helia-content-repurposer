import { extractYoutubeVideoId } from "./video-id";

const URL_REGEXES = [
  /https?:\/\/(?:www\.)?youtube\.com\/watch\?[^\s"'<>]+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11}/gi,
  /https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/gi,
];

/**
 * Tek satır veya yapıştırılmış metin / .url dosyası içinden ilk geçerli YouTube URL’sini döndürür.
 */
export function extractYoutubeUrlFromText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (extractYoutubeVideoId(trimmed)) {
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return `https://www.youtube.com/watch?v=${trimmed}`;
    }
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      /* fall through */
    }
  }

  for (const re of URL_REGEXES) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(trimmed)) !== null) {
      const candidate = m[0].replace(/[.,);]+$/, "");
      if (extractYoutubeVideoId(candidate)) return candidate;
    }
  }

  return null;
}
