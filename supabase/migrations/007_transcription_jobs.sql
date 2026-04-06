-- Arka plan transkripsiyon işleri (Inngest); sonuç kullanıcıya RLS ile görünür.

create table if not exists public.transcription_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'needs_audio')),
  source_type text not null check (source_type in ('storage', 'youtube')),
  storage_paths text[] not null default array[]::text[],
  youtube_url text,
  result_text text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transcription_jobs_user_created_idx
  on public.transcription_jobs (user_id, created_at desc);

create index if not exists transcription_jobs_user_status_idx
  on public.transcription_jobs (user_id, status);

alter table public.transcription_jobs enable row level security;

drop policy if exists "transcription_jobs_select_own" on public.transcription_jobs;
create policy "transcription_jobs_select_own"
  on public.transcription_jobs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transcription_jobs_insert_own" on public.transcription_jobs;
create policy "transcription_jobs_insert_own"
  on public.transcription_jobs for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on table public.transcription_jobs is 'Async transcription jobs (Whisper / YouTube captions); worker uses service role to update.';
