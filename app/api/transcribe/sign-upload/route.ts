import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { TRANSCRIBE_TEMP_BUCKET } from "@/lib/storage/transcribe-bucket";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";
import { checkUserProSubscription } from "@/lib/subscription/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Oturumlu kullanıcı için Supabase Storage imzalı yükleme (token + path).
 * İstemci `uploadToSignedUrl(path, token, file)` ile Vercel gövdesine takılmadan yükler.
 */
export async function POST(): Promise<Response> {
  try {
    const { isConfigured } = getPublicSupabaseConfig();
    if (!isConfigured) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPro = await checkUserProSubscription(supabase);
    if (!isPro) {
      return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
    }

    const objectPath = `${user.id}/${crypto.randomUUID()}.m4a`;
    const { data, error } = await supabase.storage
      .from(TRANSCRIBE_TEMP_BUCKET)
      .createSignedUploadUrl(objectPath, { upsert: true });

    if (error || !data) {
      console.error("[api/transcribe/sign-upload]", error?.message);
      return NextResponse.json(
        {
          error:
            error?.message ??
            "Could not create upload URL. Ensure bucket transcribe-temp exists (migration 006).",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
      bucket: TRANSCRIBE_TEMP_BUCKET,
      signedUrl: data.signedUrl,
    });
  } catch (e) {
    console.error("[api/transcribe/sign-upload]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
