-- Add surrogate `id` PK on plans (stable UUIDs for API / clients; `name` stays unique).
-- IDs are mirrored in `lib/plans/plan-ids.ts`.

alter table public.plans
  add column if not exists id uuid;

update public.plans
set id = 'a0000001-0000-4000-8000-000000000001'::uuid
where name = 'free' and id is null;
update public.plans
set id = 'a0000001-0000-4000-8000-000000000002'::uuid
where name = 'aylik' and id is null;
update public.plans
set id = 'a0000001-0000-4000-8000-000000000003'::uuid
where name = 'pro' and id is null;
update public.plans
set id = 'a0000001-0000-4000-8000-000000000004'::uuid
where name = 'yearly' and id is null;

alter table public.plans alter column id set default gen_random_uuid();
alter table public.plans alter column id set not null;

alter table public.plans drop constraint plans_pkey;
alter table public.plans add primary key (id);
alter table public.plans add constraint plans_name_key unique (name);
