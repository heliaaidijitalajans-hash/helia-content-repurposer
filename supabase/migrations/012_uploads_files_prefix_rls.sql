-- Obje yolu: files/<timestamp>-<ad> (SDK upload ile uyumlu)

drop policy if exists "uploads_insert_own" on storage.objects;

create policy "uploads_insert_authenticated_files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'uploads'
    and split_part(name, '/', 1) = 'files'
  );
