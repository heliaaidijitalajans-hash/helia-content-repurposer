import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { transcribeJob } from "@/inngest/functions/transcribe-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Inngest adımları (her çağrı ayrı sunucusuz çalıştırma). */
export const maxDuration = 300;

/**
 * Public endpoint for Inngest Cloud (no app auth). Verify with Signing Key in dashboard.
 * Set INNGEST_SIGNING_KEY (and optional INNGEST_SIGNING_KEY_FALLBACK) in Vercel env.
 * Production URL: https://helia-content-repurposer.vercel.app/api/inngest
 */
const serveOrigin =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [transcribeJob],
  servePath: "/api/inngest",
  ...(serveOrigin ? { serveOrigin } : {}),
});
