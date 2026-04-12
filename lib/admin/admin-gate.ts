import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_GATE_COOKIE = "helia_admin_gate";

/** Panel şifresi tanımlı mı (tanımlı değilse geliştirme kolaylığı için kapı atlanır). */
export function isAdminGatePasswordConfigured(): boolean {
  return Boolean(process.env.HELIA_ADMIN_PANEL_PASSWORD?.trim());
}

function gateHmacSecret(): string {
  return (
    process.env.HELIA_ADMIN_GATE_SECRET?.trim() ||
    process.env.HELIA_ADMIN_PANEL_PASSWORD?.trim() ||
    ""
  );
}

export function createAdminGateToken(userId: string, ttlSeconds = 60 * 60 * 8): string {
  const secret = gateHmacSecret();
  if (!secret) {
    throw new Error("HELIA_ADMIN_PANEL_PASSWORD or HELIA_ADMIN_GATE_SECRET required");
  }
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${userId}.${exp}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminGateToken(token: string, userId: string): boolean {
  const secret = gateHmacSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [uid, expStr, nonce, sig] = parts;
  if (uid !== userId) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const payload = `${uid}.${expStr}.${nonce}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyAdminPanelPassword(input: string, expected: string): boolean {
  const hi = createHash("sha256").update(input, "utf8").digest();
  const he = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(hi, he);
}

export async function requireAdminGateOrPass(
  userId: string,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  if (!isAdminGatePasswordConfigured()) {
    return { ok: true };
  }
  const jar = await cookies();
  const token = jar.get(ADMIN_GATE_COOKIE)?.value ?? "";
  if (!verifyAdminGateToken(token, userId)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin gate required", code: "ADMIN_GATE" },
        { status: 403 },
      ),
    };
  }
  return { ok: true };
}
