-- Tarayıcıdan (authenticated JWT) public.users SELECT/INSERT/UPDATE için açık izinler.
-- Bazı projelerde varsayılan GRANT veya politika kapsamı eksik kalınca 403 / RLS hatası oluşabiliyor.

grant usage on schema public to anon, authenticated;

grant select, insert, update on table public.users to authenticated;

drop policy if exists "Users select own app row" on public.users;
create policy "Users select own app row"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users insert own app row" on public.users;
create policy "Users insert own app row"
  on public.users
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users update own app row" on public.users;
create policy "Users update own app row"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
