-- Senkron transkripsiyon sonuçları (POST /api/transcribe + Whisper)

create table if not exists public.transcriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'failed')),
  result text,
  error_message text,
  file_name text,
  created_at timestamptz not null default now()
);

create index if not exists transcriptions_user_created_idx
  on public.transcriptions (user_id, created_at desc);

alter table public.transcriptions enable row level security;

drop policy if exists "transcriptions_select_own" on public.transcriptions;
create policy "transcriptions_select_own"
  on public.transcriptions for select
  to authenticated
  using (auth.uid() = user_id);

comment on table public.transcriptions is 'Doğrudan API transkripsiyon çıktıları; insert service role ile yapılır.';
