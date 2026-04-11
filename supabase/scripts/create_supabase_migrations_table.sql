-- Tek seferlik: Postgres log’da "relation supabase_migrations.schema_migrations does not exist"
-- görüyorsanız veya `supabase db push` / migration araçları bu tabloyu arıyorsa çalıştırın.
-- Supabase Dashboard → SQL Editor → bu dosyanın tamamını yapıştırıp Run.

create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text not null,
  statements text[],
  name text,
  constraint schema_migrations_pkey primary key (version)
);

comment on table supabase_migrations.schema_migrations is
  'Supabase CLI migration geçmişi (db push / migration list).';
