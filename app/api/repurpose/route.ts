import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRepurpose } from "@/lib/repurpose/generate";
import { FREE_REPURPOSE_LIMIT } from "@/lib/usage/free-tier";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text =
    body &&
    typeof body === "object" &&
    "text" in body &&
    typeof (body as { text: unknown }).text === "string"
      ? (body as { text: string }).text
      : "";

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Provide non-empty text in the request body." },
      { status: 400 },
    );
  }

  const { data: quotaRows, error: quotaError } = await supabase.rpc(
    "consume_repurpose_quota",
    { p_limit: FREE_REPURPOSE_LIMIT },
  );

  if (quotaError) {
    console.error("consume_repurpose_quota:", quotaError.message);
    return NextResponse.json(
      { error: "Usage limit could not be verified. Try again later." },
      { status: 503 },
    );
  }

  const quota = Array.isArray(quotaRows) ? quotaRows[0] : quotaRows;
  const allowed =
    quota &&
    typeof quota === "object" &&
    "allowed" in quota &&
    (quota as { allowed: boolean }).allowed === true;

  if (!allowed) {
    return NextResponse.json(
      { error: "Upgrade to continue" },
      { status: 403 },
    );
  }

  try {
    const result = await generateRepurpose(text);

    const { error } = await supabase.from("repurposes").insert({
      user_id: user.id,
      source_excerpt: text.slice(0, 2000),
      result,
    });

    if (error) {
      console.warn("repurposes insert skipped:", error.message);
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to generate repurposed content." },
      { status: 500 },
    );
  }
}
