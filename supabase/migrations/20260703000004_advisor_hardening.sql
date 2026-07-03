-- ============================================================================
-- Advisor remediation: search_path, RPC exposure, FK indexes, RLS initplan.
-- ============================================================================

-- 1) set_updated_at: pin search_path (function_search_path_mutable)
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- 2) Trigger-only SECURITY DEFINER functions must not be callable via PostgREST
--    RPC. Triggers still fire (they don't check the invoker's EXECUTE grant).
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.guard_task_update() from anon, authenticated;
revoke execute on function public.guard_profile_update() from anon, authenticated;
-- is_admin() is intentionally left callable by `authenticated` — RLS policies
-- evaluate it as the querying role, and it only returns the caller's own status.
revoke execute on function public.is_admin() from anon;

-- 3) Covering indexes for the remaining foreign keys (unindexed_foreign_keys)
create index if not exists notifications_task_idx  on public.notifications(task_id);
create index if not exists task_photos_uploader_idx on public.task_photos(uploaded_by);
create index if not exists tasks_approved_by_idx    on public.tasks(approved_by);
create index if not exists tasks_created_by_idx      on public.tasks(created_by);

-- 4) RLS initplan: wrap auth.uid() in a scalar subquery so it is evaluated once
--    per statement instead of once per row (auth_rls_initplan).
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists tasks_janitor_update on public.tasks;
create policy tasks_janitor_update on public.tasks
  for update to authenticated
  using (assignee_id = (select auth.uid()))
  with check (assignee_id = (select auth.uid()));

drop policy if exists task_photos_write on public.task_photos;
create policy task_photos_write on public.task_photos
  for all to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.assignee_id = (select auth.uid()))
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.assignee_id = (select auth.uid()))
  );

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists push_subs_own on public.push_subscriptions;
create policy push_subs_own on public.push_subscriptions
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- 5) Public avatars bucket: drop the broad listing SELECT policy (public buckets
--    serve object URLs without it) (public_bucket_allows_listing).
drop policy if exists "avatars_read" on storage.objects;
