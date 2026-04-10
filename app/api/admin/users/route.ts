import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/assert-admin-api";
import type { AdminUserRow } from "@/lib/admin/types";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";

export async function GET() {
  const auth = await assertAdminApi();
  if (!auth.ok) return auth.response;

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (service role)" },
      { status: 503 },
    );
  }

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("users")
      .select("id, email, plan, video_credits, text_credits")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/users]", error.message);
      return NextResponse.json({ error: "Liste alınamadı" }, { status: 500 });
    }

    const rows = (data ?? []) as AdminUserRow[];
    const totalUsers = rows.length;
    const totalVideoCredits = rows.reduce(
      (s, r) => s + (typeof r.video_credits === "number" ? r.video_credits : 0),
      0,
    );
    const totalTextCredits = rows.reduce(
      (s, r) => s + (typeof r.text_credits === "number" ? r.text_credits : 0),
      0,
    );

    return NextResponse.json({
      users: rows,
      stats: {
        totalUsers,
        totalVideoCredits,
        totalTextCredits,
      },
    });
  } catch (e) {
    console.error("[admin/users]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
