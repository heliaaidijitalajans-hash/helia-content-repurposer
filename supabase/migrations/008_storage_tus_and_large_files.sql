-- Büyük dosyalar (1GB+); TUS parçalı yükleme için güncelleme politikası.

update storage.buckets
set file_size_limit = null
where id = 'transcribe-temp';

-- TUS (PATCH) ile devam eden yüklemeler için.
drop policy if exists "transcribe_temp_update_own" on storage.objects;
create policy "transcribe_temp_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'transcribe-temp'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'transcribe-temp'
    and split_part(name, '/', 1) = auth.uid()::text
  );
