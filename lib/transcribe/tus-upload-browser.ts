"use client";

import { Upload } from "tus-js-client";
import { getSupabaseStorageResumableUrl } from "@/lib/supabase/resumable";

export type TusUploadProgress = (uploaded: number, total: number) => void;

/**
 * Supabase Storage TUS — 6 MB parça (Supabase gereksinimi), kaldığı yerden devam.
 */
export function uploadFileResumableToSupabase(options: {
  file: File;
  bucket: string;
  objectPath: string;
  projectUrl: string;
  anonKey: string;
  accessToken: string;
  onProgress?: TusUploadProgress;
  signal?: AbortSignal;
}): Promise<void> {
  const endpoint = getSupabaseStorageResumableUrl(options.projectUrl);
  if (!endpoint) {
    return Promise.reject(new Error("invalid_supabase_url"));
  }

  return new Promise((resolve, reject) => {
    const upload = new Upload(options.file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10_000, 20_000],
      headers: {
        authorization: `Bearer ${options.accessToken}`,
        apikey: options.anonKey,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: options.bucket,
        objectName: options.objectPath,
        contentType: options.file.type || "application/octet-stream",
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError: (err) => reject(err),
      onProgress: (bytesUploaded, bytesTotal) => {
        options.onProgress?.(bytesUploaded, bytesTotal);
      },
      onSuccess: () => resolve(),
    });

    const onAbort = () => {
      upload.abort(true);
      reject(new DOMException("Aborted", "AbortError"));
    };
    options.signal?.addEventListener("abort", onAbort, { once: true });

    void upload
      .findPreviousUploads()
      .then((previous) => {
        if (previous.length) {
          upload.resumeFromPreviousUpload(previous[0]!);
        }
        upload.start();
      })
      .catch(reject);
  });
}
