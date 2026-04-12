import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminGatePasswordConfigured, verifyAdminGateToken } from "@/lib/admin/admin-gate";
import { assertAdminEmailOnly } from "@/lib/admin/assert-admin-api";

/** İstemci: admin misin, panel şifresi isteniyor mu, çerez geçerli mi. */
export async function GET() {
  const auth = await assertAdminEmailOnly();
  if (!auth.ok) return auth.response;

  const configured = isAdminGatePasswordConfigured();
  const jar = await cookies();
  const token = jar.get("helia_admin_gate")?.value ?? "";
  const unlocked = !configured || verifyAdminGateToken(token, auth.userId);

  return NextResponse.json({
    ok: true as const,
    gateConfigured: configured,
    unlocked,
  });
}
