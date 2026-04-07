import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "helia-content-repurposer",
  name: "Helia Content Repurposer",
  eventKey: process.env.INNGEST_EVENT_KEY,
  /** Verifies requests from Inngest Cloud to `/api/inngest` (falls back to env if omitted). */
  signingKey: process.env.INNGEST_SIGNING_KEY,
  signingKeyFallback: process.env.INNGEST_SIGNING_KEY_FALLBACK,
});
