-- Per-user subscription plan (used by /api/transcribe and /api/usage).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App profile; plan gates features such as video transcription.';

create index if not exists profiles_plan_idx on public.profiles (plan);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- New signups get a profile row with plan = free.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, plan)
  values (new.id, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

-- Existing users (run once when migration applies).
insert into public.profiles (id, plan)
select id, 'free' from auth.users
on conflict (id) do nothing;
