import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseStorageResumableUrl } from "@/lib/supabase/resumable";
import { TRANSCRIBE_TEMP_BUCKET } from "@/lib/storage/transcribe-bucket";
import { checkUserProSubscription } from "@/lib/subscription/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TUS yükleme için nesne yolu üretir (istemci `tus-js-client` ile doğrudan Storage’a yükler).
 */
export async function POST(): Promise<Response> {
  try {
    const { isConfigured, url } = getPublicSupabaseConfig();
    if (!isConfigured || !url) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    const resumableEndpoint = getSupabaseStorageResumableUrl(url);
    if (!resumableEndpoint) {
      return NextResponse.json(
        { error: "Invalid NEXT_PUBLIC_SUPABASE_URL for resumable uploads." },
        { status: 500 },
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

    return NextResponse.json({
      objectPath,
      bucket: TRANSCRIBE_TEMP_BUCKET,
      resumableEndpoint,
      projectUrl: url,
    });
  } catch (e) {
    console.error("[api/transcribe/upload-session]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
