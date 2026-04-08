-- Genel medya yüklemeleri (transkripsiyon öncesi); public URL ile sunucu indirir.

insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', true, 524288000)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "uploads_insert_own" on storage.objects;
create policy "uploads_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'uploads'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "uploads_select_own" on storage.objects;
create policy "uploads_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'uploads'
    and split_part(name, '/', 1) = auth.uid()::text
  );
