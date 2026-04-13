/** `public.users` satırı — `select("*")` / insert dönüşü */
export type PublicAppUserRow = Record<string, unknown> & {
  id: string;
  text_credits?: number;
  video_credits?: number;
};
