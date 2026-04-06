/**
 * Tarayıcı bazen `File.type` boş bırakır; uzantıdan olası MIME (Whisper / UI izin listesi için).
 */
const EXT_PRIMARY_MIME: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mp4: "video/mp4",
  m4a: "audio/mp4",
  aac: "audio/aac",
};

export function extensionFromFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** Boş veya bilinmeyen uzantıda boş string. */
export function mimeFromExtension(ext: string): string {
  const e = ext.toLowerCase().replace(/^\./, "");
  return EXT_PRIMARY_MIME[e] ?? "";
}

/**
 * Önce `file.type`, yoksa dosya adı uzantısından tahmin.
 */
export function effectiveAudioVideoMime(file: File): string {
  const fromType = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
  if (fromType) return fromType;
  return mimeFromExtension(extensionFromFilename(file.name || ""));
}
