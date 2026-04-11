-- Yeni auth kullanıcılarında public.users satırına e-posta da yazılsın (tekillik + admin panel).
create or replace function public.handle_new_user_app_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_video int;
  v_text int;
  v_email text;
begin
  select p.video_limit, p.text_limit into v_video, v_text
  from public.plans p
  where p.name = 'free';

  if v_video is null then
    v_video := 30;
    v_text := 3;
  end if;

  v_email := nullif(trim(lower(coalesce(new.email, ''))), '');

  insert into public.users (id, email, plan, video_credits, text_credits)
  values (new.id, v_email, 'free', v_video, v_text)
  on conflict (id) do nothing;

  return new;
end;
$$;
