import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenleri gerekli.",
  );
}

/**
 * Düz @supabase/supabase-js istemcisi (anon API çağrıları vb.).
 * Oturum + Next.js çerezleri için: `import { createClient } from "@/lib/supabase/client"`.
 */
export const supabase = createClient(url, anonKey);
