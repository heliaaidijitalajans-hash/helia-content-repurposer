import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/assert-admin-api";
import type { AdminPlanRow } from "@/lib/admin/types";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  const auth = await assertAdminApi();
  if (!auth.ok) return auth.response;

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Server configuration (service role)" },
      { status: 503 },
    );
  }

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("plans")
      .select(
        "id, name, video_limit, text_limit, price_display_tr, price_display_en, sort_order, updated_at",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("[admin/plans GET]", error.message);
      return NextResponse.json({ error: "Could not load plans" }, { status: 500 });
    }

    return NextResponse.json({ plans: (data ?? []) as AdminPlanRow[] });
  } catch (e) {
    console.error("[admin/plans GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) return auth.response;

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Server configuration (service role)" },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!json || typeof json !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const o = json as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if ("video_limit" in o) {
    const v = o.video_limit;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) {
      return NextResponse.json({ error: "Invalid video_limit" }, { status: 400 });
    }
    patch.video_limit = v;
  }

  if ("text_limit" in o) {
    const v = o.text_limit;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0) {
      return NextResponse.json({ error: "Invalid text_limit" }, { status: 400 });
    }
    patch.text_limit = v;
  }

  if ("price_display_tr" in o) {
    const s = o.price_display_tr;
    if (s !== null && typeof s !== "string") {
      return NextResponse.json({ error: "Invalid price_display_tr" }, { status: 400 });
    }
    patch.price_display_tr = s === null ? null : s.trim() || null;
  }

  if ("price_display_en" in o) {
    const s = o.price_display_en;
    if (s !== null && typeof s !== "string") {
      return NextResponse.json({ error: "Invalid price_display_en" }, { status: 400 });
    }
    patch.price_display_en = s === null ? null : s.trim() || null;
  }

  if ("sort_order" in o) {
    const v = o.sort_order;
    if (typeof v !== "number" || !Number.isInteger(v)) {
      return NextResponse.json({ error: "Invalid sort_order" }, { status: 400 });
    }
    patch.sort_order = v;
  }

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("plans")
      .update(patch)
      .eq("id", id)
      .select(
        "id, name, video_limit, text_limit, price_display_tr, price_display_en, sort_order, updated_at",
      )
      .maybeSingle();

    if (error) {
      console.error("[admin/plans PATCH]", error.message);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan: data as AdminPlanRow });
  } catch (e) {
    console.error("[admin/plans PATCH]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
