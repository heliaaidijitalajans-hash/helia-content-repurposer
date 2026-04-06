-- Geçici transkripsiyon dosyaları: tarayıcı imzalı URL ile yükler, API service role ile indirir/siler.

insert into storage.buckets (id, name, public, file_size_limit)
values ('transcribe-temp', 'transcribe-temp', false, 31457280)
on conflict (id) do nothing;

-- Kullanıcı yalnızca kendi klasörüne (ilk path segmenti = auth.uid) yazabilir.
drop policy if exists "transcribe_temp_insert_own" on storage.objects;
create policy "transcribe_temp_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'transcribe-temp'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "transcribe_temp_select_own" on storage.objects;
create policy "transcribe_temp_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'transcribe-temp'
  and split_part(name, '/', 1) = auth.uid()::text
);
