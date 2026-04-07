import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const OPENAI_TRANSCRIPTIONS =
  "https://api.openai.com/v1/audio/transcriptions";
const TRANSCRIBE_MODEL = "gpt-4o-transcribe";
/** OpenAI ses uç noktası yaklaşık üst sınır (byte) */
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_PREFIXES = [
  "audio/",
  "video/mp4",
  "video/quicktime",
  "application/octet-stream",
];

function logError(label: string, err: unknown) {
  console.log(`[api/transcribe] ERROR ${label}`, err);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    path: "/api/transcribe",
    method: "POST form field: file (audio/video)",
  });
}

export async function POST(req: Request): Promise<Response> {
  console.log("[api/transcribe] POST — formData alınıyor");

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.log("[api/transcribe] OPENAI_API_KEY eksik");
    return NextResponse.json(
      { success: false, error: "OPENAI_API_KEY sunucuda tanımlı değil." },
      { status: 503 },
    );
  }

  const { isConfigured } = getPublicSupabaseConfig();
  if (!isConfigured) {
    return NextResponse.json(
      {
        success: false,
        error: "Supabase ortam değişkenleri eksik (NEXT_PUBLIC_*).",
      },
      { status: 503 },
    );
  }

  if (!isServiceRoleConfigured()) {
    console.log("[api/transcribe] service role eksik");
    return NextResponse.json(
      {
        success: false,
        error:
          "SUPABASE_SERVICE_ROLE_KEY veya SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL eksik.",
      },
      { status: 503 },
    );
  }

  let userId: string | null = null;
  try {
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    userId = user?.id ?? null;
  } catch (e) {
    logError("auth.getUser", e);
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      {
        success: false,
        error: "Content-Type: multipart/form-data ve file alanı gerekli.",
      },
      { status: 400 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    logError("formData", e);
    return NextResponse.json(
      { success: false, error: "Form verisi okunamadı." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    console.log("[api/transcribe] file yok veya boş");
    return NextResponse.json(
      { success: false, error: "Dosya gerekli (form alanı: file)." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        error: `Dosya çok büyük (en fazla ${Math.floor(MAX_FILE_BYTES / (1024 * 1024))} MB).`,
      },
      { status: 413 },
    );
  }

  const mime = (file.type || "application/octet-stream").toLowerCase();
  const mimeOk =
    ALLOWED_PREFIXES.some((p) => mime.startsWith(p) || mime === p) ||
    mime === "";
  if (!mimeOk) {
    return NextResponse.json(
      {
        success: false,
        error: `Desteklenmeyen dosya türü: ${mime || "(belirtilmedi)"}`,
      },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const uint8 = new Uint8Array(buf);

  const openaiBody = new FormData();
  openaiBody.append(
    "file",
    new Blob([uint8], { type: file.type || "application/octet-stream" }),
    file.name || "audio",
  );
  openaiBody.append("model", TRANSCRIBE_MODEL);

  let text = "";
  try {
    const ores = await fetch(OPENAI_TRANSCRIPTIONS, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openaiBody,
    });
    const raw = await ores.text();
    if (!ores.ok) {
      console.log("[api/transcribe] OpenAI hata", ores.status, raw.slice(0, 500));
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI: ${ores.status} — ${raw.slice(0, 300)}`,
        },
        { status: 502 },
      );
    }
    let parsed: { text?: string };
    try {
      parsed = JSON.parse(raw) as { text?: string };
    } catch {
      logError("OpenAI JSON", raw.slice(0, 200));
      return NextResponse.json(
        { success: false, error: "OpenAI yanıtı geçersiz JSON." },
        { status: 502 },
      );
    }
    text = typeof parsed.text === "string" ? parsed.text : "";
  } catch (e) {
    logError("OpenAI fetch", e);
    return NextResponse.json(
      { success: false, error: "OpenAI isteği başarısız." },
      { status: 502 },
    );
  }

  const admin = createServiceRoleClient();
  const { data: row, error: insErr } = await admin
    .from("transcriptions")
    .insert({
      user_id: userId,
      status: "done",
      result: text,
      file_name: file.name || null,
    })
    .select("id")
    .single();

  if (insErr) {
    console.log("[api/transcribe] Supabase insert hata", insErr);
    return NextResponse.json(
      {
        success: false,
        error: insErr.message,
        transcribedText: text,
        warning: "Metin üretildi ancak veritabanına kaydedilemedi.",
      },
      { status: 500 },
    );
  }

  const id = row?.id as string;
  console.log("[api/transcribe] Kayıt oluşturuldu", id);

  return NextResponse.json({
    success: true,
    id,
    text,
    message: "Transkripsiyon tamamlandı ve kaydedildi.",
  });
}
