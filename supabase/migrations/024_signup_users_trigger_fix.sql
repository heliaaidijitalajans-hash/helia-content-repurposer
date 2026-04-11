-- Kayıt: "database error saving new user" — genelde public.users tetikleyicisi veya e-posta tekilliği.
-- 1) auth.users silinmiş ama public.users'ta aynı e-posta kalmışsa unique index (018) insert'i patlatır; yetim satırı temizle.
-- 2) name / created_at / updated_at açıkça yazılsın (023 ile uyumlu).
-- 3) Aynı id ile satır varsa e-posta ve adı güncelle, kredileri sıfırlama.

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

  -- Yetim satır: artık auth.users'ta olmayan id, aynı e-posta ile yeni hesap açılıyor
  if v_email is not null then
    delete from public.users u
    where not exists (select 1 from auth.users au where au.id = u.id)
      and u.email is not null
      and trim(u.email) <> ''
      and lower(trim(u.email)) = v_email;
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
