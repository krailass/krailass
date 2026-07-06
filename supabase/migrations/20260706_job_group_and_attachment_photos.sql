-- Attachment photos on task creation + multi-assignee job grouping.
--
-- 1) A third photo kind, 'attachment': reference images an admin attaches when
--    creating a task, shown to the janitor. (before/after remain the report set.)
--    NOTE: ALTER TYPE ... ADD VALUE must run outside a transaction on some setups;
--    applied via execute_sql separately from the DDL below.
alter type photo_kind add value if not exists 'attachment';

-- 2) job_group links tasks that were split from one job to several janitors
--    (งานใครงานมัน). Null for ordinary single-assignee tasks.
alter table public.tasks add column if not exists job_group uuid;
create index if not exists idx_tasks_job_group on public.tasks(job_group);
