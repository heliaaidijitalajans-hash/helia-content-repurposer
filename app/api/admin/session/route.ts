import { NextResponse } from "next/server";
import { assertAdminEmailOnly } from "@/lib/admin/assert-admin-api";

/** İstemci: oturum + admin e-postası (kapı şifresi hariç). */
export async function GET() {
  const auth = await assertAdminEmailOnly();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true as const });
}
