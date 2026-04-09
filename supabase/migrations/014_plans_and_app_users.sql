-- Catalog of sellable plans (credits = limits granted on purchase / selection).
create table if not exists public.plans (
  name text primary key check (name in ('free', 'aylik', 'pro', 'yearly')),
  video_limit int not null check (video_limit >= 0),
  text_limit int not null check (text_limit >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.plans is 'Pricing plans; video_limit = minutes bank, text_limit = text generations per period.';

insert into public.plans (name, video_limit, text_limit)
values
  ('free', 30, 3),
  ('aylik', 200, 40),
  ('pro', 300, 55),
  ('yearly', 3000, 550)
on conflict (name) do update set
  video_limit = excluded.video_limit,
  text_limit = excluded.text_limit,
  updated_at = now();

alter table public.plans enable row level security;

create policy "plans readable by anyone"
  on public.plans for select
  using (true);

-- App user row (credits + selected plan). Separate from auth.users.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'aylik', 'pro', 'yearly')),
  video_credits int not null default 30 check (video_credits >= 0),
  text_credits int not null default 3 check (text_credits >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Per-app plan and credit balances (synced to usage for legacy RPCs).';

create index if not exists users_plan_idx on public.users (plan);

alter table public.users enable row level security;

create policy "Users select own app row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users insert own app row"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users update own app row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- New auth users get a public.users row matching free plan.
create or replace function public.handle_new_user_app_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_video int;
  v_text int;
begin
  select p.video_limit, p.text_limit into v_video, v_text
  from public.plans p
  where p.name = 'free';

  if v_video is null then
    v_video := 30;
    v_text := 3;
  end if;

  insert into public.users (id, plan, video_credits, text_credits)
  values (new.id, 'free', v_video, v_text)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_app_user on auth.users;

create trigger on_auth_user_created_app_user
  after insert on auth.users
  for each row execute procedure public.handle_new_user_app_user();

-- Backfill existing accounts.
insert into public.users (id, plan, video_credits, text_credits)
select
  au.id,
  'free',
  (select p.video_limit from public.plans p where p.name = 'free' limit 1),
  (select p.text_limit from public.plans p where p.name = 'free' limit 1)
from auth.users au
on conflict (id) do nothing;

-- Allow authenticated users to set their subscription row (demo checkout; protect with payment in production).
drop policy if exists "Users insert own subscription" on public.subscriptions;
create policy "Users insert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own subscription" on public.subscriptions;
create policy "Users update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
