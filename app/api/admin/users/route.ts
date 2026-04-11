import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/assert-admin-api";
import type { AdminStats, AdminUserRow } from "@/lib/admin/types";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";

type UserRowDb = {
  id: string;
  email: string | null;
  plan: string;
  video_credits: number;
  text_credits: number;
};

type UsageRow = {
  user_id: string;
  request_count: number | null;
  transcribe_count: number | null;
  updated_at: string | null;
};

type SubRow = {
  user_id: string;
  plan: string;
  updated_at: string | null;
};

async function listAuthUserMeta(
  admin: SupabaseClient,
): Promise<
  Map<
    string,
    { email: string; last_sign_in_at: string | null; created_at: string | null }
  >
> {
  const map = new Map<
    string,
    { email: string; last_sign_in_at: string | null; created_at: string | null }
  >();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      console.warn("[admin/users] auth.admin.listUsers:", error.message);
      break;
    }
    const batch = data?.users ?? [];
    for (const u of batch) {
      map.set(u.id, {
        email: typeof u.email === "string" ? u.email : "",
        last_sign_in_at: u.last_sign_in_at ?? null,
        created_at: u.created_at ?? null,
      });
    }
    if (batch.length < perPage) break;
    page += 1;
  }
  return map;
}

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

    const { data: userData, error: userErr } = await admin
      .from("users")
      .select("id, email, plan, video_credits, text_credits")
      .order("created_at", { ascending: false });

    if (userErr) {
      console.error("[admin/users]", userErr.message);
      return NextResponse.json({ error: "Liste alınamadı" }, { status: 500 });
    }

    const baseRows = (userData ?? []) as UserRowDb[];

    const [{ data: usageData }, { data: subData }, authMeta] =
      await Promise.all([
        admin
          .from("usage")
          .select("user_id, request_count, transcribe_count, updated_at"),
        admin.from("subscriptions").select("user_id, plan, updated_at"),
        listAuthUserMeta(admin),
      ]);

    const usageByUser = new Map<string, UsageRow>();
    for (const row of (usageData ?? []) as UsageRow[]) {
      usageByUser.set(row.user_id, row);
    }

    const subByUser = new Map<string, SubRow>();
    for (const row of (subData ?? []) as SubRow[]) {
      subByUser.set(row.user_id, row);
    }

    const rows: AdminUserRow[] = baseRows.map((r) => {
      const au = authMeta.get(r.id);
      const us = usageByUser.get(r.id);
      const sub = subByUser.get(r.id);
      const pubEmail = r.email?.trim() || null;
      const authEmail = au?.email?.trim() || null;
      return {
        id: r.id,
        email: pubEmail ?? authEmail ?? null,
        plan: r.plan,
        video_credits: r.video_credits,
        text_credits: r.text_credits,
        subscription_plan: sub?.plan ?? null,
        subscription_updated_at: sub?.updated_at ?? null,
        repurposes_used:
          typeof us?.request_count === "number" ? us.request_count : 0,
        transcribes_used:
          typeof us?.transcribe_count === "number" ? us.transcribe_count : 0,
        last_sign_in_at: au?.last_sign_in_at ?? null,
        registered_at: au?.created_at ?? null,
      };
    });

    const totalUsers = rows.length;
    const totalAuthUsers = authMeta.size;
    const totalVideoCredits = rows.reduce(
      (s, r) => s + (typeof r.video_credits === "number" ? r.video_credits : 0),
      0,
    );
    const totalTextCredits = rows.reduce(
      (s, r) => s + (typeof r.text_credits === "number" ? r.text_credits : 0),
      0,
    );

    let subscriptionProCount = 0;
    let subscriptionFreeCount = 0;
    for (const row of subData ?? []) {
      const p = (row as SubRow).plan;
      if (p === "pro") subscriptionProCount += 1;
      else if (p === "free") subscriptionFreeCount += 1;
    }

    const planCounts: Record<string, number> = {};
    for (const r of rows) {
      const p = r.plan || "unknown";
      planCounts[p] = (planCounts[p] ?? 0) + 1;
    }

    let totalRepurposes = 0;
    let totalTranscribes = 0;
    for (const u of usageByUser.values()) {
      totalRepurposes +=
        typeof u.request_count === "number" ? u.request_count : 0;
      totalTranscribes +=
        typeof u.transcribe_count === "number" ? u.transcribe_count : 0;
    }

    const stats: AdminStats = {
      totalUsers,
      totalAuthUsers,
      subscriptionProCount,
      subscriptionFreeCount,
      planCounts,
      totalRepurposes,
      totalTranscribes,
      totalVideoCredits,
      totalTextCredits,
    };

    return NextResponse.json({ users: rows, stats });
  } catch (e) {
    console.error("[admin/users]", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
