import OpenAI from "openai";

/**
 * Next.js Route Handler / Server Action ortamı için OpenAI istemcisi.
 * @see https://github.com/openai/openai-node
 */
let cached: OpenAI | null = null;

export function getOpenAIServerClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  if (!cached) {
    cached = new OpenAI({
      apiKey: key,
      timeout: 120_000,
      maxRetries: 2,
    });
  }
  return cached;
}
