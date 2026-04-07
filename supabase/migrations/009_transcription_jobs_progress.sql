-- Job progress (0–100 or opaque step index); optional for UI.

alter table public.transcription_jobs
  add column if not exists progress integer not null default 0;
