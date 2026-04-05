-- Run in Supabase SQL editor or via CLI after linking the project.

create table if not exists public.repurposes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  source_excerpt text not null,
  result jsonb not null,
  created_at timestamptz default now() not null
);

create index if not exists repurposes_user_id_created_at_idx
  on public.repurposes (user_id, created_at desc);

alter table public.repurposes enable row level security;

create policy "Users read own repurposes"
  on public.repurposes for select
  using (auth.uid() = user_id);

create policy "Users insert own repurposes"
  on public.repurposes for insert
  with check (auth.uid() = user_id);
