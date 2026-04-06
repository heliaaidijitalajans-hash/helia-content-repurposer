/**
 * Tarayıcıda ffmpeg.wasm ile video/ses → AAC (.m4a) dönüşümü (Vercel gövde limiti için).
 * Yalnızca istemci bileşenlerinden dinamik import ile kullanın.
 */

import type { FFmpeg } from "@ffmpeg/ffmpeg";

const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

/** @internal Paylaşımlı ffmpeg örneği (transcode + parçalama). */
export async function getFfmpeg(signal?: AbortSignal): Promise<FFmpeg> {
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      await ffmpeg.load(
        {
          coreURL: await toBlobURL(
            `${CORE_BASE}/ffmpeg-core.js`,
            "text/javascript",
          ),
          wasmURL: await toBlobURL(
            `${CORE_BASE}/ffmpeg-core.wasm`,
            "application/wasm",
          ),
        },
        { signal },
      );
      return ffmpeg;
    })();
  }
  return ffmpegLoadPromise;
}

function inputNameFor(file: File): string {
  const dot = file.name.lastIndexOf(".");
  const ext =
    dot >= 0 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  if (ext === "mp4" || ext === "mp3" || ext === "wav" || ext === "m4a") {
    return `input.${ext}`;
  }
  return "input.bin";
}

function baseNameFrom(file: File): string {
  const n = file.name.replace(/\.[^.]+$/, "").trim();
  return n.length > 0 ? n : "audio";
}

/**
 * AAC (.m4a, audio/mp4) üretir — Whisper ile uyumlu, gövde boyutu küçük.
 */
export async function transcodeToM4aAac(
  file: File,
  signal?: AbortSignal,
): Promise<File> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await getFfmpeg(signal);
  const input = inputNameFor(file);
  const output = "out.m4a";

  await ffmpeg.writeFile(input, await fetchFile(file), { signal });

  const code = await ffmpeg.exec(
    [
      "-i",
      input,
      "-vn",
      "-c:a",
      "aac",
      "-b:a",
      "64k",
      "-ar",
      "44100",
      "-ac",
      "1",
      "-movflags",
      "+faststart",
      output,
    ],
    -1,
    { signal },
  );

  if (code !== 0) {
    await ffmpeg.deleteFile(input).catch(() => {});
    await ffmpeg.deleteFile(output).catch(() => {});
    throw new Error("ffmpeg_nonzero_exit");
  }

  const data = await ffmpeg.readFile(output, "binary", { signal });
  await ffmpeg.deleteFile(input).catch(() => {});
  await ffmpeg.deleteFile(output).catch(() => {});

  if (!(data instanceof Uint8Array)) {
    throw new Error("unexpected_readfile_result");
  }
  const bytes = new Uint8Array(data.byteLength);
  bytes.set(data);
  const blob = new Blob([bytes], { type: "audio/mp4" });
  const name = `${baseNameFrom(file)}-audio.m4a`;
  return new File([blob], name, { type: "audio/mp4" });
}

/** OpenAI Whisper tek istek başına üst sınır. */
export const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

/**
 * 25 MB üzeri AAC akışını zaman dilimlerine böler (her parça Whisper limitinin altında kalmalı).
 * ~64 kbps için 420 sn ≈ 3,3 MB/parça.
 */
export async function splitM4aBySegmentTime(
  file: File,
  segmentSeconds: number,
  signal?: AbortSignal,
): Promise<File[]> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await getFfmpeg(signal);
  const input = "split_in.m4a";
  const pattern = "part_%03d.m4a";

  await ffmpeg.writeFile(input, await fetchFile(file), { signal });

  const code = await ffmpeg.exec(
    [
      "-i",
      input,
      "-f",
      "segment",
      "-segment_time",
      String(segmentSeconds),
      "-reset_timestamps",
      "1",
      "-c:a",
      "aac",
      "-b:a",
      "64k",
      "-ar",
      "44100",
      "-ac",
      "1",
      pattern,
    ],
    -1,
    { signal },
  );

  await ffmpeg.deleteFile(input).catch(() => {});

  if (code !== 0) {
    const listing = await ffmpeg.listDir("/").catch(() => []);
    for (const n of listing) {
      if (n.name.startsWith("part_")) {
        await ffmpeg.deleteFile(n.name).catch(() => {});
      }
    }
    throw new Error("ffmpeg_segment_failed");
  }

  const listing = await ffmpeg.listDir("/");
  const names = listing
    .map((n) => n.name)
    .filter((name) => /^part_\d{3}\.m4a$/.test(name))
    .sort();

  const parts: File[] = [];
  for (const name of names) {
    const data = await ffmpeg.readFile(name, "binary", { signal });
    await ffmpeg.deleteFile(name).catch(() => {});
    if (!(data instanceof Uint8Array) || data.byteLength === 0) continue;
    const bytes = new Uint8Array(data.byteLength);
    bytes.set(data);
    parts.push(
      new File([new Blob([bytes], { type: "audio/mp4" })], name, {
        type: "audio/mp4",
      }),
    );
  }

  if (parts.length === 0) {
    throw new Error("no_audio_chunks");
  }
  return parts;
}

export async function ensureWhisperSizedParts(
  file: File,
  signal?: AbortSignal,
): Promise<File[]> {
  if (file.size <= WHISPER_MAX_BYTES) return [file];
  return splitM4aBySegmentTime(file, 420, signal);
}
