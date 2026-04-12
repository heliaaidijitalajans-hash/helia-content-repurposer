export type AdminUserRow = {
  id: string;
  email: string | null;
  plan: string;
  video_credits: number;
  text_credits: number;
  /** `subscriptions` tablosu (free/pro) */
  subscription_plan: string | null;
  subscription_updated_at: string | null;
  /** `usage.request_count` — metin / repurposer kullanımı */
  repurposes_used: number;
  /** `usage.transcribe_count` */
  transcribes_used: number;
  last_sign_in_at: string | null;
  registered_at: string | null;
};

export type AdminStats = {
  totalUsers: number;
  totalAuthUsers: number;
  subscriptionProCount: number;
  subscriptionFreeCount: number;
  planCounts: Record<string, number>;
  totalRepurposes: number;
  totalTranscribes: number;
  totalVideoCredits: number;
  totalTextCredits: number;
};

/** `public.plans` satırı (admin plan/fiyat sekmesi + checkout fiyat birleştirme). */
export type AdminPlanRow = {
  id: string;
  name: string;
  video_limit: number;
  text_limit: number;
  price_display_tr: string | null;
  price_display_en: string | null;
  sort_order: number;
  updated_at: string | null;
};
