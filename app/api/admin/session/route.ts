import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/assert-admin-api";

/** İstemci: oturum + admin e-postası (ve HELIA_ADMIN_EMAIL) sunucu ile uyumlu mu. */
export async function GET() {
  const auth = await assertAdminApi();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true as const });
}
