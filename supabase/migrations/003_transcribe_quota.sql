-- Free tier: limit video/audio transcriptions per user (separate from repurposer request_count).

alter table public.usage
  add column if not exists transcribe_count int not null default 0
  check (transcribe_count >= 0);

comment on column public.usage.transcribe_count is 'Count of completed transcribe API uses (free tier capped via consume_transcribe_quota).';

-- Atomically: ensure row exists, then if under limit increment transcribe_count; else deny.
create or replace function public.consume_transcribe_quota(p_limit int default 1)
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

  insert into public.usage (user_id, request_count, transcribe_count)
  values (uid, 0, 0)
  on conflict (user_id) do nothing;

  select u.transcribe_count into v_count
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
    transcribe_count = public.usage.transcribe_count + 1,
    updated_at = now()
  where user_id = uid
  returning transcribe_count into v_count;

  return query select true, v_count;
end;
$$;

grant execute on function public.consume_transcribe_quota(int) to authenticated;

comment on function public.consume_transcribe_quota(int) is 'Increments transcribe_count if under p_limit; returns whether allowed and new count.';
