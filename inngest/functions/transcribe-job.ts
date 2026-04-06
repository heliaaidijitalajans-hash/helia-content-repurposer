import OpenAI from "openai";
import { toFile } from "openai";
import {
  extensionFromFilename,
  mimeFromExtension,
} from "@/lib/transcribe/mime-from-extension";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { TRANSCRIBE_TEMP_BUCKET } from "@/lib/storage/transcribe-bucket";
import { extractYoutubeVideoId } from "@/lib/youtube/video-id";
import { inngest } from "../client";

const MAX_WHISPER_BYTES = 25 * 1024 * 1024;

type JobRow = {
  id: string;
  user_id: string;
  status: string;
  source_type: string;
  storage_paths: string[] | null;
  youtube_url: string | null;
};

async function failJob(jobId: string, message: string) {
  const admin = createServiceRoleClient();
  const { data: row } = await admin
    .from("transcription_jobs")
    .select("storage_paths")
    .eq("id", jobId)
    .maybeSingle();

  const paths = row?.storage_paths;
  if (Array.isArray(paths) && paths.length > 0) {
    await admin.storage
      .from(TRANSCRIBE_TEMP_BUCKET)
      .remove(paths)
      .catch(() => {});
  }

  await admin
    .from("transcription_jobs")
    .update({
      status: "failed",
      error_message: message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

export const transcribeJob = inngest.createFunction(
  {
    id: "transcribe-job",
    name: "Transcribe job (Whisper / YouTube)",
    retries: 1,
    triggers: [{ event: "transcribe/job.requested" }],
    onFailure: async ({ event, error }) => {
      const original = event.data.event as { data?: { jobId?: string } };
      const jobId = original?.data?.jobId;
      if (jobId) {
        await failJob(jobId, error.message || "transcription_failed");
      }
    },
  },
  async ({ event, step }) => {
    const jobId = (event.data as { jobId?: string }).jobId;
    if (!jobId) {
      throw new Error("missing_job_id");
    }

    const job = await step.run("load-job", async () => {
      const admin = createServiceRoleClient();
      const { data, error } = await admin
        .from("transcription_jobs")
        .select(
          "id,user_id,status,source_type,storage_paths,youtube_url",
        )
        .eq("id", jobId)
        .single();

      if (error || !data) {
        throw new Error(`job_not_found:${error?.message}`);
      }
      return data as JobRow;
    });

    await step.run("mark-processing", async () => {
      const admin = createServiceRoleClient();
      await admin
        .from("transcription_jobs")
        .update({
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    });

    if (job.source_type === "youtube" && job.youtube_url) {
      const vid = extractYoutubeVideoId(job.youtube_url);
      if (!vid) {
        await step.run("fail-invalid-youtube", async () => {
          await failJob(jobId, "Invalid YouTube URL.");
        });
        return { ok: false };
      }

      const captionText = await step.run("youtube-captions", async () => {
        const { YoutubeTranscript } = await import("youtube-transcript");
        try {
          const chunks = await YoutubeTranscript.fetchTranscript(vid);
          return chunks.map((c: { text: string }) => c.text).join(" ").trim();
        } catch {
          return "";
        }
      });

      if (captionText.length > 0) {
        await step.run("complete-youtube-captions", async () => {
          const admin = createServiceRoleClient();
          await admin
            .from("transcription_jobs")
            .update({
              status: "completed",
              result_text: captionText,
              updated_at: new Date().toISOString(),
            })
            .eq("id", jobId);
        });
        return { ok: true, mode: "youtube_captions" };
      }

      await step.run("youtube-needs-audio", async () => {
        const admin = createServiceRoleClient();
        await admin
          .from("transcription_jobs")
          .update({
            status: "needs_audio",
            error_message:
              "No captions found for this video. Upload an audio file to transcribe via the queue, or try a video with auto-generated or manual subtitles.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId);
      });
      return { ok: false, mode: "youtube_needs_audio" };
    }

    const paths = Array.isArray(job.storage_paths) ? job.storage_paths : [];
    if (paths.length === 0) {
      await step.run("fail-no-paths", async () => {
        await failJob(jobId, "No files attached to this job.");
      });
      return { ok: false };
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      await step.run("fail-no-openai", async () => {
        await failJob(jobId, "OPENAI_API_KEY is not configured on the server.");
      });
      return { ok: false };
    }

    const openai = new OpenAI({
      apiKey,
      timeout: 240_000,
      maxRetries: 2,
    });

    const texts: string[] = [];

    for (let i = 0; i < paths.length; i++) {
      const p = paths[i]!;
      const segment = await step.run(`whisper-${i}`, async () => {
        const admin = createServiceRoleClient();
        const { data: blob, error: dlErr } = await admin.storage
          .from(TRANSCRIBE_TEMP_BUCKET)
          .download(p);

        if (dlErr || !blob) {
          throw new Error(`download_failed:${dlErr?.message ?? "unknown"}`);
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        if (buffer.byteLength === 0) {
          throw new Error("empty_file");
        }
        if (buffer.byteLength > MAX_WHISPER_BYTES) {
          throw new Error("segment_exceeds_whisper_limit");
        }

        const name = p.split("/").pop() || "audio.m4a";
        const ext = extensionFromFilename(name);
        const mimeType = mimeFromExtension(ext) || "audio/mp4";
        const file = await toFile(buffer, name, { type: mimeType });
        const transcription = await openai.audio.transcriptions.create({
          file,
          model: "whisper-1",
        });
        return typeof transcription.text === "string"
          ? transcription.text.trim()
          : "";
      });
      texts.push(segment);
    }

    await step.run("cleanup-storage", async () => {
      const admin = createServiceRoleClient();
      await admin.storage.from(TRANSCRIBE_TEMP_BUCKET).remove(paths);
    });

    await step.run("complete-storage", async () => {
      const admin = createServiceRoleClient();
      await admin
        .from("transcription_jobs")
        .update({
          status: "completed",
          result_text: texts.filter(Boolean).join("\n\n"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    });

    return { ok: true, mode: "storage_whisper" };
  },
);
