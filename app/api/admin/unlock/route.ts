import { NextResponse } from "next/server";
import {
  ADMIN_GATE_COOKIE,
  createAdminGateToken,
  isAdminGatePasswordConfigured,
  verifyAdminPanelPassword,
} from "@/lib/admin/admin-gate";
import { assertAdminEmailOnly } from "@/lib/admin/assert-admin-api";

export async function POST(req: Request) {
  const auth = await assertAdminEmailOnly();
  if (!auth.ok) return auth.response;

  if (!isAdminGatePasswordConfigured()) {
    const res = NextResponse.json({ ok: true as const, skipped: true });
    return res;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password?: unknown }).password ?? "")
      : "";

  const expected = process.env.HELIA_ADMIN_PANEL_PASSWORD!.trim();
  if (!verifyAdminPanelPassword(password, expected)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  let token: string;
  try {
    token = createAdminGateToken(auth.userId);
  } catch (e) {
    console.error("[admin/unlock]", e);
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true as const });
  res.cookies.set({
    name: ADMIN_GATE_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
