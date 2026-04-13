-- /api/transcribe: JWT ile RPC bazen auth.uid() alamıyor; service role ile atomik düşüm (users önce, sonra usage).

create or replace function public.service_decrement_video_credit(p_user_id uuid)
returns table (ok boolean, remaining int, credit_pool text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining int;
begin
  if p_user_id is null then
    return query select false, 0, null::text;
    return;
  end if;

  update public.users u
  set
    video_credits = u.video_credits - 1,
    updated_at = now()
  where u.id = p_user_id
    and u.video_credits >= 1
  returning u.video_credits into v_remaining;

  if v_remaining is not null then
    return query select true, v_remaining, 'users'::text;
    return;
  end if;

  insert into public.usage (user_id, request_count, transcribe_count, text_credits, video_credits)
  values (p_user_id, 0, 0, 3, 30)
  on conflict (user_id) do nothing;

  update public.usage u
  set
    video_credits = u.video_credits - 1,
    updated_at = now()
  where u.user_id = p_user_id
    and u.video_credits >= 1
  returning u.video_credits into v_remaining;

  if v_remaining is not null then
    return query select true, v_remaining, 'usage'::text;
    return;
  end if;

  return query
  select
    false,
    coalesce(
      (select u2.video_credits from public.users u2 where u2.id = p_user_id),
      (select u3.video_credits from public.usage u3 where u3.user_id = p_user_id),
      0
    ),
    null::text;
end;
$$;

comment on function public.service_decrement_video_credit(uuid) is
  'Transcribe: önce public.users.video_credits, yoksa public.usage.video_credits -1. Yalnız service_role.';

create or replace function public.service_refund_video_credit(p_user_id uuid, p_pool text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null or p_pool is null then
    return;
  end if;

  if p_pool = 'users' then
    update public.users u
    set video_credits = u.video_credits + 1, updated_at = now()
    where u.id = p_user_id;
  elsif p_pool = 'usage' then
    update public.usage u
    set video_credits = u.video_credits + 1, updated_at = now()
    where u.user_id = p_user_id;
  end if;
end;
$$;

comment on function public.service_refund_video_credit(uuid, text) is
  'service_decrement_video_credit iadesi; p_pool: users | usage. Yalnız service_role.';

revoke all on function public.service_decrement_video_credit(uuid) from public;
revoke all on function public.service_decrement_video_credit(uuid) from anon, authenticated;
grant execute on function public.service_decrement_video_credit(uuid) to service_role;

revoke all on function public.service_refund_video_credit(uuid, text) from public;
revoke all on function public.service_refund_video_credit(uuid, text) from anon, authenticated;
grant execute on function public.service_refund_video_credit(uuid, text) to service_role;
