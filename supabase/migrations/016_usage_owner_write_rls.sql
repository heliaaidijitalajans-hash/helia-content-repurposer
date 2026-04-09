-- Allow authenticated users to sync credits from plan selection / checkout (own row only).
-- Previously only SELECT was allowed; API routes using the user JWT could not upsert usage.

drop policy if exists "Users insert own usage" on public.usage;
create policy "Users insert own usage"
  on public.usage for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own usage" on public.usage;
create policy "Users update own usage"
  on public.usage for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
