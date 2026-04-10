import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/assert-admin-api";
import { normalizePlanNameForDb } from "@/lib/plans/normalize-plan-name";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBody(raw: unknown): {
  userId: string;
  video_credits: number;
  text_credits: number;
  plan: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const userId = typeof o.userId === "string" ? o.userId.trim() : "";
  const plan = typeof o.plan === "string" ? o.plan.trim() : "";
  const v = o.video_credits;
  const t = o.text_credits;
  if (!UUID_RE.test(userId)) return null;
  if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v))
    return null;
  if (typeof t !== "number" || !Number.isFinite(t) || !Number.isInteger(t))
    return null;
  if (v < 0 || t < 0) return null;
  if (!plan) return null;
  return { userId, video_credits: v, text_credits: t, plan };
}

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) return auth.response;

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (service role)" },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const parsed = parseBody(json);
  if (!parsed) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  const planDb = normalizePlanNameForDb(parsed.plan);
  if (!planDb) {
    return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin
      .from("users")
      .update({
        plan: planDb,
        video_credits: parsed.video_credits,
        text_credits: parsed.text_credits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.userId);

    if (error) {
      console.error("[admin/update-user]", error.message);
      return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/update-user]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
