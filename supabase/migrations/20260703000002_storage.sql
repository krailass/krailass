-- ============================================================================
-- Storage: task-photos (private) + avatars (public)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('task-photos', 'task-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- task-photos: read for all authenticated staff (private bucket, signed URLs).
-- Write/modify/delete restricted to admins or the assignee of the task the
-- object belongs to. Path convention: tasks/{task_id}/{before|after}/{file}
-- => (storage.foldername(name))[2] is the task_id.
create policy "task_photos_read" on storage.objects
  for select to authenticated using (bucket_id = 'task-photos');

create policy "task_photos_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'task-photos' and (
      public.is_admin()
      or exists (
        select 1 from public.tasks t
        where t.id::text = (storage.foldername(name))[2]
          and t.assignee_id = auth.uid()
      )
    )
  );

create policy "task_photos_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'task-photos' and (
      public.is_admin()
      or exists (
        select 1 from public.tasks t
        where t.id::text = (storage.foldername(name))[2]
          and t.assignee_id = auth.uid()
      )
    )
  );

create policy "task_photos_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'task-photos' and (public.is_admin() or owner = auth.uid()));

-- avatars: public read, owner writes
create policy "avatars_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars' and owner = auth.uid());
create policy "avatars_modify" on storage.objects
  for update to authenticated using (bucket_id = 'avatars' and owner = auth.uid());
create policy "avatars_remove" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars' and owner = auth.uid());
</content>
