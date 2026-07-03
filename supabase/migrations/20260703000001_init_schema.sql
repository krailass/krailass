-- ============================================================================
-- Sawai janitor work-management — core schema, RLS, triggers
-- Project: fobturaedgcxangbaxdh (apply ONLY to this project)
-- ============================================================================

-- ---------- Enums ----------------------------------------------------------
do $$ begin
  create type public.user_role       as enum ('admin','janitor');            exception when duplicate_object then null; end $$;
do $$ begin
  create type public.task_status     as enum ('pending','progress','done');  exception when duplicate_object then null; end $$;
do $$ begin
  create type public.approval_status as enum ('waiting','approved');         exception when duplicate_object then null; end $$;
do $$ begin
  create type public.task_priority   as enum ('normal','urgent');            exception when duplicate_object then null; end $$;
do $$ begin
  create type public.photo_kind      as enum ('before','after');             exception when duplicate_object then null; end $$;

-- ---------- updated_at helper ----------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------- profiles (1:1 auth.users) --------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  prefix     text not null default '',              -- นาย / นาง / นางสาว
  role       public.user_role not null default 'janitor',
  zone       text,                                  -- เขต / หน้าที่
  phone      text,
  avatar_url text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- reference tables -----------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color_bg   text not null default '#EEF1F4',
  color_text text not null default '#5A6772',
  sort       int  not null default 0
);

create table if not exists public.locations (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort int  not null default 0
);

-- ---------- tasks ----------------------------------------------------------
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  reporter      text,                                -- ผู้แจ้ง / ผู้ขอรับบริการ
  location      text,
  category      text,
  assignee_id   uuid references public.profiles(id) on delete set null,
  status        public.task_status   not null default 'pending',
  approval      public.approval_status,             -- null until reported
  priority      public.task_priority not null default 'normal',
  due_text      text,                                -- freeform e.g. "ทุกวัน"
  due_date      date,
  assigned_date date,                                -- วันที่มอบหมาย
  assigned_time time,                                -- เวลาที่มอบหมาย
  materials     text,
  place         text,                                -- สถานที่ปฏิบัติงาน (report)
  time_start    time,
  time_end      time,
  note          text,
  created_by    uuid references public.profiles(id) on delete set null,
  approved_by   uuid references public.profiles(id) on delete set null,
  approved_at   timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists tasks_assignee_idx    on public.tasks(assignee_id);
create index if not exists tasks_status_idx       on public.tasks(status);
create index if not exists tasks_assigned_date_idx on public.tasks(assigned_date);
create index if not exists tasks_due_date_idx      on public.tasks(due_date);

create trigger tasks_set_updated_at    before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- task_photos (unbounded photos per set) -------------------------
create table if not exists public.task_photos (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  kind         public.photo_kind not null,
  storage_path text not null,
  sort         int  not null default 0,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists task_photos_task_idx on public.task_photos(task_id);

-- ---------- notifications --------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null default 'info',
  title      text not null,
  body       text,
  task_id    uuid references public.tasks(id) on delete set null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, is_read);

-- ---------- push_subscriptions ---------------------------------------------
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subscriptions(user_id);

-- ---------- role helper (SECURITY DEFINER, no RLS recursion) ---------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- ---------- new-user -> profile --------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- SECURITY: never trust a client-supplied role. Every new account is created
  -- as 'janitor'. Admin roles are granted explicitly by the service-role key
  -- (seed / provisioning), which bypasses the guard via auth.uid() IS NULL.
  insert into public.profiles (id, full_name, prefix, role, zone, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'prefix', ''),
    'janitor',
    new.raw_user_meta_data->>'zone',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- janitor column guard on tasks ----------------------------------
-- Non-admins may only change report/status fields on their own task, and may
-- never self-approve or reassign.
create or replace function public.guard_task_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Admins and service-role/SQL contexts (no end-user JWT) are unrestricted.
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;

  if old.assignee_id is distinct from auth.uid() then
    raise exception 'not allowed to modify this task';
  end if;

  if new.assignee_id  is distinct from old.assignee_id
     or new.title     is distinct from old.title
     or new.reporter  is distinct from old.reporter
     or new.location  is distinct from old.location
     or new.category  is distinct from old.category
     or new.priority  is distinct from old.priority
     or new.due_text  is distinct from old.due_text
     or new.due_date  is distinct from old.due_date
     or new.assigned_date is distinct from old.assigned_date
     or new.assigned_time is distinct from old.assigned_time
     or new.created_by   is distinct from old.created_by
     or new.approved_by  is distinct from old.approved_by
     or new.approved_at  is distinct from old.approved_at then
    raise exception 'janitor may not modify assignment/approval fields';
  end if;

  -- janitor may set approval only to waiting (report submit), never approved
  if new.approval = 'approved' then
    raise exception 'janitor may not approve tasks';
  end if;

  return new;
end $$;

create trigger tasks_guard_update before update on public.tasks
  for each row execute function public.guard_task_update();

-- ---------- profile self-update guard (no self privilege escalation) --------
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Admins and service-role/SQL contexts (no end-user JWT) are unrestricted.
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;
  -- A non-admin editing their own row may not change role or active status.
  if new.role is distinct from old.role
     or new.is_active is distinct from old.is_active then
    raise exception 'not allowed to change role or active status';
  end if;
  return new;
end $$;

create trigger profiles_guard_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.locations         enable row level security;
alter table public.tasks             enable row level security;
alter table public.task_photos       enable row level security;
alter table public.notifications     enable row level security;
alter table public.push_subscriptions enable row level security;

-- profiles: everyone authenticated can read (names for assignment); admin writes
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_admin_write on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy profiles_self_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- reference: read all authenticated; admin manages
create policy categories_select on public.categories for select to authenticated using (true);
create policy categories_admin  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy locations_select  on public.locations  for select to authenticated using (true);
create policy locations_admin   on public.locations  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- tasks: read all authenticated; admin full; janitor updates own (guarded by trigger)
create policy tasks_select on public.tasks
  for select to authenticated using (true);
create policy tasks_admin_write on public.tasks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy tasks_janitor_update on public.tasks
  for update to authenticated
  using (assignee_id = auth.uid())
  with check (assignee_id = auth.uid());

-- task_photos: read all; write by task assignee or admin
create policy task_photos_select on public.task_photos
  for select to authenticated using (true);
create policy task_photos_write on public.task_photos
  for all to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.assignee_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.assignee_id = auth.uid())
  );

-- notifications: own only
create policy notifications_own on public.notifications
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- push_subscriptions: own only
create policy push_subs_own on public.push_subscriptions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
</content>
