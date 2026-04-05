-- Free tier: 5 repurposes per user (total). Tracks in public.usage.

create table if not exists public.usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  request_count int not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists usage_updated_at_idx on public.usage (updated_at desc);

alter table public.usage enable row level security;

create policy "Users can read own usage row"
  on public.usage for select
  using (auth.uid() = user_id);

-- No direct insert/update from clients — only via RPC (security definer).

-- Atomically: ensure row exists, then if under limit increment and allow; else deny.
create or replace function public.consume_repurpose_quota(p_limit int default 5)
returns table (allowed boolean, current_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_count int;
begin
  if uid is null then
    return query select false, 0;
    return;
  end if;

  insert into public.usage (user_id, request_count)
  values (uid, 0)
  on conflict (user_id) do nothing;

  select u.request_count into v_count
  from public.usage u
  where u.user_id = uid
  for update;

  if v_count is null then
    v_count := 0;
  end if;

  if v_count >= p_limit then
    return query select false, v_count;
    return;
  end if;

  update public.usage
  set
    request_count = public.usage.request_count + 1,
    updated_at = now()
  where user_id = uid
  returning request_count into v_count;

  return query select true, v_count;
end;
$$;

grant execute on function public.consume_repurpose_quota(int) to authenticated;

comment on table public.usage is 'Per-user repurposer request counts (free tier limit enforced in consume_repurpose_quota).';
