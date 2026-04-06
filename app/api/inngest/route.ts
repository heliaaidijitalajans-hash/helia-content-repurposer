import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { transcribeJob } from "@/inngest/functions/transcribe-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Inngest adımları (her çağrı ayrı sunucusuz çalıştırma). */
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [transcribeJob],
});
