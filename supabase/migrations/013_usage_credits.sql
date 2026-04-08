-- Text / video credits per user (replaces count-only free tier for billing UX).

alter table public.usage
  add column if not exists text_credits int not null default 3
    check (text_credits >= 0);

alter table public.usage
  add column if not exists video_credits int not null default 30
    check (video_credits >= 0);

comment on column public.usage.text_credits is 'Remaining text repurposer credits (1 per successful generation).';
comment on column public.usage.video_credits is 'Remaining video minutes bank (deducted by ceil(duration_seconds/60), min 1 per job).';

-- Atomically consume 1 text credit if available.
create or replace function public.reserve_text_credit()
returns table (ok boolean, remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_remaining int;
begin
  if uid is null then
    return query select false, 0;
    return;
  end if;

  insert into public.usage (user_id, request_count, transcribe_count, text_credits, video_credits)
  values (uid, 0, 0, 3, 30)
  on conflict (user_id) do nothing;

  update public.usage u
  set
    text_credits = u.text_credits - 1,
    updated_at = now()
  where u.user_id = uid
    and u.text_credits >= 1
  returning u.text_credits into v_remaining;

  if v_remaining is null then
    select u.text_credits into v_remaining
    from public.usage u
    where u.user_id = uid;
    return query select false, coalesce(v_remaining, 0);
    return;
  end if;

  return query select true, v_remaining;
end;
$$;

create or replace function public.refund_text_credit()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return;
  end if;

  update public.usage u
  set
    text_credits = u.text_credits + 1,
    updated_at = now()
  where u.user_id = uid;
end;
$$;

-- p_minutes: billed minutes (caller sends >= 1).
create or replace function public.reserve_video_credits(p_minutes int)
returns table (ok boolean, remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_need int := greatest(1, coalesce(p_minutes, 1));
  v_remaining int;
begin
  if uid is null then
    return query select false, 0;
    return;
  end if;

  insert into public.usage (user_id, request_count, transcribe_count, text_credits, video_credits)
  values (uid, 0, 0, 3, 30)
  on conflict (user_id) do nothing;

  update public.usage u
  set
    video_credits = u.video_credits - v_need,
    updated_at = now()
  where u.user_id = uid
    and u.video_credits >= v_need
  returning u.video_credits into v_remaining;

  if v_remaining is null then
    select u.video_credits into v_remaining
    from public.usage u
    where u.user_id = uid;
    return query select false, coalesce(v_remaining, 0);
    return;
  end if;

  return query select true, v_remaining;
end;
$$;

create or replace function public.refund_video_credits(p_minutes int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_need int := greatest(1, coalesce(p_minutes, 1));
begin
  if uid is null then
    return;
  end if;

  update public.usage u
  set
    video_credits = u.video_credits + v_need,
    updated_at = now()
  where u.user_id = uid;
end;
$$;

grant execute on function public.reserve_text_credit() to authenticated;
grant execute on function public.refund_text_credit() to authenticated;
grant execute on function public.reserve_video_credits(int) to authenticated;
grant execute on function public.refund_video_credits(int) to authenticated;
