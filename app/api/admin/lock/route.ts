import { NextResponse } from "next/server";
import { ADMIN_GATE_COOKIE } from "@/lib/admin/admin-gate";
import { assertAdminEmailOnly } from "@/lib/admin/assert-admin-api";

export async function POST() {
  const auth = await assertAdminEmailOnly();
  if (!auth.ok) return auth.response;

  const res = NextResponse.json({ ok: true as const });
  res.cookies.set({
    name: ADMIN_GATE_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
