import { getServiceSupabaseUrl } from "@/lib/supabase/admin";
import { UPLOADS_BUCKET } from "@/lib/storage/uploads-bucket";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = "gpt-4o-transcribe";
const MAX_BYTES = 25 * 1024 * 1024;

function isAllowedStorageUrl(urlString: string): boolean {
  const base = getServiceSupabaseUrl();
  if (!base) return false;
  try {
    const u = new URL(urlString);
    const origin = new URL(base);
    if (u.origin !== origin.origin) return false;
    return u.pathname.includes(
      `/storage/v1/object/public/${UPLOADS_BUCKET}/`,
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return new Response(JSON.stringify({ error: "No URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isAllowedStorageUrl(url)) {
    console.log("[api/transcribe] URL reddedildi:", url.slice(0, 120));
    return new Response(JSON.stringify({ error: "Invalid storage URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let audioRes: Response;
  try {
    audioRes = await fetch(url, { redirect: "follow" });
  } catch (e) {
    console.error("[api/transcribe] fetch url:", e);
    return new Response(JSON.stringify({ error: "Download failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!audioRes.ok) {
    return new Response(
      JSON.stringify({ error: `Download failed: ${audioRes.status}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const len = audioRes.headers.get("content-length");
  if (len) {
    const n = parseInt(len, 10);
    if (Number.isFinite(n) && n > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "File too large for OpenAI" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const buffer = await audioRes.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return new Response(JSON.stringify({ error: "File too large for OpenAI" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = new FormData();
  formData.append("file", new Blob([buffer]), "audio.mp4");
  formData.append("model", MODEL);

  let openaiRes: Response;
  try {
    openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });
  } catch (e) {
    console.error("[api/transcribe] OpenAI fetch:", e);
    return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  let result: unknown;
  try {
    result = await openaiRes.json();
  } catch {
    return new Response(JSON.stringify({ error: "OpenAI invalid JSON" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(result), {
    status: openaiRes.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
}
