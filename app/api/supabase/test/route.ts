import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase/test-connection";

/**
 * GET /api/supabase/test — basic Supabase connectivity using Project URL + anon key.
 */
export async function GET() {
  const result = await testSupabaseConnection();

  if (result.ok) {
    return NextResponse.json({
      connected: true,
      latencyMs: result.latencyMs,
      detail: result.detail,
      ...("extra" in result && result.extra ? { auth: result.extra } : {}),
    });
  }

  return NextResponse.json(
    {
      connected: false,
      stage: result.stage,
      message: result.message,
      latencyMs: result.latencyMs,
      status: result.status,
    },
    { status: result.stage === "env" ? 503 : 502 },
  );
}
