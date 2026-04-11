-- /signup 500: "Database error saving new user"
-- Olası nedenler: (1) public.users.name kolonu yok, (2) RLS / tetikleyici rolü (supabase_auth_admin),
-- (3) yetim satır silinirken FK hatası.
--
-- Supabase SQL Editor'da postgres ile çalıştırın. Ardından Dashboard → Authentication → Users ile test edin.

-- 023 atlandıysa insert patlar
alter table public.users add column if not exists name text not null default '';

-- Auth servisi tetikleyiciyi çağırır; şema + fonksiyon execute
grant usage on schema public to supabase_auth_admin;

grant execute on function public.handle_new_user_app_user() to supabase_auth_admin;
grant execute on function public.handle_new_user_profile() to supabase_auth_admin;
grant execute on function public.handle_new_user_subscription() to supabase_auth_admin;

-- Fonksiyon sahibi postgres olsun (RLS’yi tablo sahibi olarak aşar)
alter function public.handle_new_user_app_user() owner to postgres;
alter function public.handle_new_user_profile() owner to postgres;
alter function public.handle_new_user_subscription() owner to postgres;

-- Ek güvence: tetikleyici bağlamında RLS (SELECT vermeden yazma)
drop policy if exists "Allow auth admin insert users" on public.users;
create policy "Allow auth admin insert users"
  on public.users for insert to supabase_auth_admin with check (true);

drop policy if exists "Allow auth admin update users" on public.users;
create policy "Allow auth admin update users"
  on public.users for update to supabase_auth_admin using (true) with check (true);

drop policy if exists "Allow auth admin delete users" on public.users;
create policy "Allow auth admin delete users"
  on public.users for delete to supabase_auth_admin using (true);

drop policy if exists "Allow auth admin insert profiles" on public.profiles;
create policy "Allow auth admin insert profiles"
  on public.profiles
  for insert
  to supabase_auth_admin
  with check (true);

drop policy if exists "Allow auth admin insert subscriptions" on public.subscriptions;
create policy "Allow auth admin insert subscriptions"
  on public.subscriptions
  for insert
  to supabase_auth_admin
  with check (true);

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
  v_name text;
begin
  select p.video_limit, p.text_limit into v_video, v_text
  from public.plans p
  where p.name = 'free'
  limit 1;

  if v_video is null then
    v_video := 30;
    v_text := 3;
  end if;

  v_email := nullif(trim(lower(coalesce(new.email, ''))), '');
  v_name := coalesce(nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''), '');

  if v_email is not null then
    begin
      delete from public.users u
      where not exists (select 1 from auth.users au where au.id = u.id)
        and u.email is not null
        and trim(u.email) <> ''
        and lower(trim(u.email)) = v_email;
    exception
      when others then
        raise warning 'handle_new_user_app_user orphan delete skipped: %', sqlerrm;
    end;
  end if;

  insert into public.users (id, email, name, plan, video_credits, text_credits, created_at, updated_at)
  values (new.id, v_email, v_name, 'free', v_video, v_text, now(), now())
  on conflict (id) do update set
    email = coalesce(excluded.email, public.users.email),
    name = case
      when excluded.name <> '' then excluded.name
      else public.users.name
    end,
    updated_at = now();

  return new;
end;
$$;

alter function public.handle_new_user_app_user() owner to postgres;
grant execute on function public.handle_new_user_app_user() to supabase_auth_admin;
