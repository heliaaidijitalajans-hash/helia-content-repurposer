import { createClient } from "@/lib/supabase/server";
import {
  createServiceRoleClient,
  getServiceSupabaseUrl,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { UPLOADS_BUCKET } from "@/lib/storage/uploads-bucket";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const TRANSCRIBE_MODEL = "gpt-4o-transcribe";
/** OpenAI ses girişi üst sınırı */
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function publicUploadsPathPattern(): string {
  return `/storage/v1/object/public/${UPLOADS_BUCKET}/`;
}

function isAllowedStorageFileUrl(fileUrl: string): boolean {
  const base = getServiceSupabaseUrl();
  if (!base) return false;
  let u: URL;
  let origin: URL;
  try {
    u = new URL(fileUrl);
    origin = new URL(base);
  } catch {
    return false;
  }
  if (u.origin !== origin.origin) return false;
  return u.pathname.includes(publicUploadsPathPattern());
}

export async function POST(request: Request): Promise<Response> {
  let body: { fileUrl?: unknown };
  try {
    body = (await request.json()) as { fileUrl?: unknown };
  } catch (e) {
    console.log("[api/transcribe] JSON parse hata", e);
    return Response.json(
      { success: false, error: "Geçersiz JSON (fileUrl gerekli)." },
      { status: 400 },
    );
  }

  const fileUrl =
    typeof body.fileUrl === "string" ? body.fileUrl.trim() : "";
  if (!fileUrl) {
    return Response.json(
      { success: false, error: "fileUrl zorunlu." },
      { status: 400 },
    );
  }

  if (!isAllowedStorageFileUrl(fileUrl)) {
    console.log("[api/transcribe] URL reddedildi", fileUrl.slice(0, 120));
    return Response.json(
      {
        success: false,
        error: "Geçersiz veya izin verilmeyen dosya adresi.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { success: false, error: "OPENAI_API_KEY eksik." },
      { status: 503 },
    );
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch (e) {
    console.log("[api/transcribe] auth", e);
  }

  let audioBuf: Buffer;
  let fileName = "audio";
  try {
    const lastSeg = fileUrl.split("/").filter(Boolean).pop();
    if (lastSeg) fileName = decodeURIComponent(lastSeg).slice(0, 200);

    const dl = await fetch(fileUrl, { redirect: "follow" });
    if (!dl.ok) {
      console.log("[api/transcribe] indirme hata", dl.status);
      return Response.json(
        { success: false, error: `Dosya indirilemedi (${dl.status}).` },
        { status: 502 },
      );
    }

    const lenHdr = dl.headers.get("content-length");
    if (lenHdr) {
      const n = parseInt(lenHdr, 10);
      if (Number.isFinite(n) && n > MAX_AUDIO_BYTES) {
        return Response.json(
          {
            success: false,
            error: `Dosya çok büyük (en fazla ${Math.floor(MAX_AUDIO_BYTES / (1024 * 1024))} MB — OpenAI sınırı).`,
          },
          { status: 413 },
        );
      }
    }

    const ab = await dl.arrayBuffer();
    audioBuf = Buffer.from(ab);
    if (audioBuf.length > MAX_AUDIO_BYTES) {
      return Response.json(
        {
          success: false,
          error: `Dosya çok büyük (en fazla ${Math.floor(MAX_AUDIO_BYTES / (1024 * 1024))} MB).`,
        },
        { status: 413 },
      );
    }
  } catch (e) {
    console.log("[api/transcribe] indirme istisna", e);
    return Response.json(
      { success: false, error: "Dosya indirilemedi." },
      { status: 502 },
    );
  }

  const mime = "application/octet-stream";
  const filePart =
    typeof File !== "undefined"
      ? new File([new Uint8Array(audioBuf)], fileName, { type: mime })
      : new Blob([new Uint8Array(audioBuf)], { type: mime });

  const openaiForm = new FormData();
  openaiForm.append("file", filePart, fileName);
  openaiForm.append("model", TRANSCRIBE_MODEL);

  let text = "";
  try {
    const ores = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openaiForm,
    });
    const raw = await ores.text();
    if (!ores.ok) {
      console.log("[api/transcribe] OpenAI", ores.status, raw.slice(0, 400));
      return Response.json(
        {
          success: false,
          error: `OpenAI: ${ores.status} — ${raw.slice(0, 280)}`,
        },
        { status: 502 },
      );
    }
    const parsed = JSON.parse(raw) as { text?: string };
    text = typeof parsed.text === "string" ? parsed.text : "";
  } catch (e) {
    console.log("[api/transcribe] OpenAI hata", e);
    return Response.json(
      { success: false, error: "OpenAI isteği başarısız." },
      { status: 502 },
    );
  }

  const { isConfigured } = getPublicSupabaseConfig();
  let rowId: string | undefined;
  if (isConfigured && isServiceRoleConfigured()) {
    try {
      const admin = createServiceRoleClient();
      const { data: row, error: insErr } = await admin
        .from("transcriptions")
        .insert({
          user_id: userId,
          status: "done",
          result: text,
          file_name: fileName,
        })
        .select("id")
        .single();
      if (insErr) {
        console.log("[api/transcribe] transcriptions insert", insErr.message);
      } else {
        rowId = row?.id as string | undefined;
      }
    } catch (e) {
      console.log("[api/transcribe] DB", e);
    }
  }

  return Response.json({
    success: true,
    text,
    id: rowId,
    message: rowId ? "Kaydedildi." : text ? "Transkripsiyon tamam (DB atlandı)." : undefined,
  });
}
