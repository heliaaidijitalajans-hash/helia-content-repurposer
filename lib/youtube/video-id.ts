export function extractYoutubeVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && id.length >= 11 ? id.slice(0, 11) : id || null;
    }

    if (host.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) {
        return u.searchParams.get("v");
      }
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] ?? null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}
