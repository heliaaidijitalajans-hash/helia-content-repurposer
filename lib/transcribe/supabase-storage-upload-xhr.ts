"use client";

/**
 * Supabase Storage standart upload (XHR) — ilerleme olayı.
 * POST …/storage/v1/object/{bucket}/{path}
 */
export function uploadToSupabaseStorageXHR(options: {
  projectUrl: string;
  anonKey: string;
  accessToken: string;
  bucket: string;
  /** Nesne yolu; örn. `${userId}/${uuid}-ad.mp3` */
  objectPath: string;
  file: File;
  onProgress?: (ratio01: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const base = options.projectUrl.replace(/\/$/, "");
  const encodedPath = options.objectPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  const url = `${base}/storage/v1/object/${options.bucket}/${encodedPath}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const onAbort = () => {
      xhr.abort();
      reject(new DOMException("Aborted", "AbortError"));
    };
    options.signal?.addEventListener("abort", onAbort, { once: true });

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && ev.total > 0) {
        options.onProgress?.(ev.loaded / ev.total);
      }
    };

    xhr.onload = () => {
      options.signal?.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        options.onProgress?.(1);
        resolve();
        return;
      }
      const msg = xhr.responseText?.slice(0, 500) || xhr.statusText;
      console.log("[storage XHR] hata", xhr.status, msg);
      reject(new Error(`Upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => {
      options.signal?.removeEventListener("abort", onAbort);
      reject(new Error("Upload network error"));
    };

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${options.accessToken}`);
    xhr.setRequestHeader("apikey", options.anonKey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader(
      "Content-Type",
      options.file.type || "application/octet-stream",
    );
    xhr.send(options.file);
  });
}

export function uploadsObjectPath(userId: string, file: File): string {
  const safe = (file.name || "media")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 160);
  return `${userId}/${crypto.randomUUID()}-${safe}`;
}
