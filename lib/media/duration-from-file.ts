/**
 * Read audio/video duration from a browser File (metadata only).
 */
export function getMediaDurationSecondsFromFile(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  const isVideo =
    file.type.startsWith("video/") ||
    /\.(mp4|webm|mov|mkv)$/i.test(file.name || "");

  return new Promise((resolve, reject) => {
    const el = document.createElement(isVideo ? "video" : "audio");
    el.preload = "metadata";
    el.muted = true;

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    el.onloadedmetadata = () => {
      const d = el.duration;
      cleanup();
      if (!Number.isFinite(d) || d <= 0) {
        reject(new Error("invalid_duration"));
        return;
      }
      resolve(d);
    };
    el.onerror = () => {
      cleanup();
      reject(new Error("metadata_error"));
    };

    el.src = url;
  });
}
