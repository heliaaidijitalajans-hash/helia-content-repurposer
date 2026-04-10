/*
  Atomik metin kredisi dusumu (service role). Repurpose API uretimden sonra bu RPC'yi cagirir.
  Eski optimistik .eq("text_credits", eski) yarismada 0 satir guncelleyip 503 uretebiliyordu.
*/

create or replace function public.service_decrement_text_credit(p_user_id uuid)
returns table (ok boolean, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining int;
begin
  update public.users u
  set
    text_credits = u.text_credits - 1,
    updated_at = now()
  where u.id = p_user_id
    and u.text_credits >= 1
  returning u.text_credits into v_remaining;

  if v_remaining is null then
    return query
    select
      false,
      coalesce(
        (select u2.text_credits from public.users u2 where u2.id = p_user_id),
        0
      );
    return;
  end if;

  return query select true, v_remaining;
end;
$$;

comment on function public.service_decrement_text_credit(uuid) is
  'Decrements public.users.text_credits by 1 if >= 1. Callable only by service_role; used after successful AI generation.';

revoke all on function public.service_decrement_text_credit(uuid) from public;
revoke all on function public.service_decrement_text_credit(uuid) from anon, authenticated;
grant execute on function public.service_decrement_text_credit(uuid) to service_role;
