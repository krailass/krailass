import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  TaskRow,
  ProfileRow,
  CategoryRow,
  LocationRow,
  NotificationRow,
  PhotoKind,
} from './database.types';
import type { TaskWithAssignee } from './task-view';
import { TASK_PHOTOS_BUCKET } from './constants';

export type SB = SupabaseClient<Database>;

const TASK_SELECT = '*, assignee:profiles!tasks_assignee_id_fkey(id,full_name,zone)';

// ---------------- Tasks ----------------
export async function fetchTasks(sb: SB): Promise<TaskWithAssignee[]> {
  const { data, error } = await sb
    .from('tasks')
    .select(TASK_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TaskWithAssignee[];
}

export interface CreateTaskInput {
  title: string;
  reporter?: string;
  location?: string;
  category?: string;
  assignee_id?: string | null;
  priority: 'normal' | 'urgent';
  due_text?: string;
  due_date?: string | null;
  assigned_date?: string | null;
  assigned_time?: string | null;
  materials?: string;
}

export async function createTask(
  sb: SB,
  input: CreateTaskInput,
  createdBy: string,
): Promise<TaskRow> {
  const { data, error } = await sb
    .from('tasks')
    .insert({ ...input, status: 'pending', approval: null, created_by: createdBy })
    .select('*')
    .single();
  if (error) throw error;
  return data as TaskRow;
}

export async function advanceTask(sb: SB, id: string): Promise<void> {
  const { error } = await sb.from('tasks').update({ status: 'progress' }).eq('id', id);
  if (error) throw error;
}

export interface SubmitReportInput {
  place?: string;
  materials?: string;
  note?: string;
  time_start?: string | null;
  time_end?: string | null;
}

export async function submitReport(sb: SB, id: string, r: SubmitReportInput): Promise<void> {
  const { error } = await sb
    .from('tasks')
    .update({
      status: 'done',
      approval: 'waiting',
      place: r.place || null,
      materials: r.materials || null,
      note: r.note || null,
      time_start: r.time_start || null,
      time_end: r.time_end || null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function approveTask(sb: SB, id: string, approverId: string): Promise<void> {
  const { error } = await sb
    .from('tasks')
    .update({ approval: 'approved', approved_by: approverId, approved_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function sendBackTask(sb: SB, id: string): Promise<void> {
  const { error } = await sb
    .from('tasks')
    .update({ status: 'progress', approval: null, approved_by: null, approved_at: null })
    .eq('id', id);
  if (error) throw error;
}

// ---------------- Profiles / staff ----------------
export async function fetchProfiles(sb: SB): Promise<ProfileRow[]> {
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function fetchJanitors(sb: SB): Promise<ProfileRow[]> {
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('role', 'janitor')
    .eq('is_active', true)
    .order('full_name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

// ---------------- Reference ----------------
export async function fetchCategories(sb: SB): Promise<CategoryRow[]> {
  const { data, error } = await sb.from('categories').select('*').order('sort');
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export async function fetchLocations(sb: SB): Promise<LocationRow[]> {
  const { data, error } = await sb.from('locations').select('*').order('sort');
  if (error) throw error;
  return (data ?? []) as LocationRow[];
}

// ---------------- Reference CRUD (admin) ----------------
export async function createLocation(sb: SB, name: string, sort = 100): Promise<void> {
  const { error } = await sb.from('locations').insert({ name: name.trim(), sort });
  if (error) throw error;
}
export async function renameLocation(sb: SB, id: string, name: string): Promise<void> {
  const { error } = await sb.from('locations').update({ name: name.trim() }).eq('id', id);
  if (error) throw error;
}
export async function deleteLocation(sb: SB, id: string): Promise<void> {
  const { error } = await sb.from('locations').delete().eq('id', id);
  if (error) throw error;
}

export async function createCategory(
  sb: SB,
  input: { name: string; color_bg: string; color_text: string; sort?: number },
): Promise<void> {
  const { error } = await sb.from('categories').insert({
    name: input.name.trim(),
    color_bg: input.color_bg,
    color_text: input.color_text,
    sort: input.sort ?? 100,
  });
  if (error) throw error;
}
export async function updateCategory(
  sb: SB,
  id: string,
  patch: { name?: string; color_bg?: string; color_text?: string },
): Promise<void> {
  const { error } = await sb.from('categories').update(patch).eq('id', id);
  if (error) throw error;
}
export async function deleteCategory(sb: SB, id: string): Promise<void> {
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ---------------- Photos ----------------
export interface TaskPhoto {
  id: string;
  kind: PhotoKind;
  path: string;
  url: string;
}

export async function fetchTaskPhotos(sb: SB, taskId: string): Promise<TaskPhoto[]> {
  const { data, error } = await sb
    .from('task_photos')
    .select('id,kind,storage_path,sort')
    .eq('task_id', taskId)
    .order('sort');
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];
  const paths = rows.map((r) => r.storage_path as string);
  const { data: signed } = await sb.storage
    .from(TASK_PHOTOS_BUCKET)
    .createSignedUrls(paths, 60 * 60);
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({
    id: r.id as string,
    kind: r.kind as PhotoKind,
    path: r.storage_path as string,
    url: urlByPath.get(r.storage_path as string) || '',
  }));
}

// ---------------- Notifications ----------------
export async function fetchNotifications(sb: SB, userId: string): Promise<NotificationRow[]> {
  const { data, error } = await sb
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function markNotificationRead(sb: SB, id: string): Promise<void> {
  const { error } = await sb.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(sb: SB, userId: string): Promise<void> {
  const { error } = await sb
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}
