-- Hesap oluşturulma zamanı (signup / ilk insert)
alter table public.users add column if not exists created_at timestamptz not null default now();

comment on column public.users.created_at is 'İlk public.users satırının oluşturulma zamanı.';
