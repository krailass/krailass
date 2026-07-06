// Hand-authored to match supabase/migrations/*.sql.
// Regenerate with the Supabase MCP `generate_typescript_types` once the schema
// is applied to project fobturaedgcxangbaxdh, then replace this file.

export type UserRole = 'admin' | 'janitor';
export type TaskStatus = 'pending' | 'progress' | 'done';
export type ApprovalStatus = 'waiting' | 'approved';
export type TaskPriority = 'normal' | 'urgent';
export type PhotoKind = 'before' | 'after' | 'attachment';

export interface ProfileRow {
  id: string;
  full_name: string;
  prefix: string;
  role: UserRole;
  zone: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  color_bg: string;
  color_text: string;
  sort: number;
}

export interface LocationRow {
  id: string;
  name: string;
  sort: number;
}

export interface TaskRow {
  id: string;
  title: string;
  reporter: string | null;
  location: string | null;
  category: string | null;
  assignee_id: string | null;
  status: TaskStatus;
  approval: ApprovalStatus | null;
  priority: TaskPriority;
  due_text: string | null;
  due_date: string | null;
  assigned_date: string | null;
  assigned_time: string | null;
  materials: string | null;
  place: string | null;
  time_start: string | null;
  time_end: string | null;
  note: string | null;
  job_group: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskPhotoRow {
  id: string;
  task_id: string;
  kind: PhotoKind;
  storage_path: string;
  sort: number;
  uploaded_by: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  task_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

interface TableDef<T> {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow>;
      categories: TableDef<CategoryRow>;
      locations: TableDef<LocationRow>;
      tasks: TableDef<TaskRow>;
      task_photos: TableDef<TaskPhotoRow>;
      notifications: TableDef<NotificationRow>;
      push_subscriptions: TableDef<PushSubscriptionRow>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      task_status: TaskStatus;
      approval_status: ApprovalStatus;
      task_priority: TaskPriority;
      photo_kind: PhotoKind;
    };
    CompositeTypes: Record<string, never>;
  };
}
