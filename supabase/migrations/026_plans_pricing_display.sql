-- Checkout / admin: görünen fiyatlar (TR/EN) ve sıralama. Kredi limitleri mevcut sütunlarda kalır.
alter table public.plans
  add column if not exists price_display_tr text,
  add column if not exists price_display_en text,
  add column if not exists sort_order int not null default 0;

comment on column public.plans.price_display_tr is 'Ödeme sayfasında gösterilen fiyat metni (TR locale).';
comment on column public.plans.price_display_en is 'Ödeme sayfasında gösterilen fiyat metni (EN locale).';
comment on column public.plans.sort_order is 'Admin ve listeler için sıra.';

update public.plans
set sort_order = case name
  when 'free' then 1
  when 'aylık' then 2
  when 'pro' then 3
  when 'yearly' then 4
  else 0
end;
