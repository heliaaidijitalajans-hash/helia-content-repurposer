import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "helia-content-repurposer",
  name: "Helia Content Repurposer",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
