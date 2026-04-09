-- public.plans / public.users: aylik → aylık (Türkçe isim, Supabase panel ile uyumlu)

alter table public.plans drop constraint if exists plans_name_check;
alter table public.users drop constraint if exists users_plan_check;

update public.plans set name = 'aylık' where name = 'aylik';
update public.users set plan = 'aylık' where plan = 'aylik';

alter table public.plans add constraint plans_name_check
  check (name in ('free', 'aylık', 'pro', 'yearly'));

alter table public.users add constraint users_plan_check
  check (plan in ('free', 'aylık', 'pro', 'yearly'));
