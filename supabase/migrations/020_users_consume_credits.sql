-- App billing: decrement balances on public.users (1 text gen / 1 video transcribe per action).

create or replace function public.consume_user_text_credit()
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

  update public.users u
  set
    text_credits = u.text_credits - 1,
    updated_at = now()
  where u.id = uid
    and u.text_credits >= 1
  returning u.text_credits into v_remaining;

  if v_remaining is null then
    select u.text_credits into v_remaining
    from public.users u
    where u.id = uid;
    return query select false, coalesce(v_remaining, 0);
    return;
  end if;

  return query select true, v_remaining;
end;
$$;

create or replace function public.refund_user_text_credit()
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

  update public.users u
  set
    text_credits = u.text_credits + 1,
    updated_at = now()
  where u.id = uid;
end;
$$;

create or replace function public.consume_user_video_credit()
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

  update public.users u
  set
    video_credits = u.video_credits - 1,
    updated_at = now()
  where u.id = uid
    and u.video_credits >= 1
  returning u.video_credits into v_remaining;

  if v_remaining is null then
    select u.video_credits into v_remaining
    from public.users u
    where u.id = uid;
    return query select false, coalesce(v_remaining, 0);
    return;
  end if;

  return query select true, v_remaining;
end;
$$;

create or replace function public.refund_user_video_credit()
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

  update public.users u
  set
    video_credits = u.video_credits + 1,
    updated_at = now()
  where u.id = uid;
end;
$$;

grant execute on function public.consume_user_text_credit() to authenticated;
grant execute on function public.refund_user_text_credit() to authenticated;
grant execute on function public.consume_user_video_credit() to authenticated;
grant execute on function public.refund_user_video_credit() to authenticated;
