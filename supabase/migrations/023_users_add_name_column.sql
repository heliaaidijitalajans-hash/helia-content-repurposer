-- public.users: kayıt formundan gelen görünen ad (isteğe bağlı)
alter table public.users add column if not exists name text not null default '';

comment on column public.users.name is 'Kayıt / profil görünen adı (full name).';
