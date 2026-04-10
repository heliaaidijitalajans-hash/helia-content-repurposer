-- public.users: e-posta ile tekillik / ensure-app-user akışı için
alter table public.users add column if not exists email text;

create unique index if not exists users_email_lower_unique
  on public.users (lower(trim(email)))
  where email is not null and trim(email) <> '';

-- Mevcut satırlar: auth.users ile eşle
update public.users u
set email = au.email
from auth.users au
where u.id = au.id
  and au.email is not null
  and trim(au.email) <> ''
  and (u.email is null or trim(u.email) = '');
