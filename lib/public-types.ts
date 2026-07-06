import type { TaskStatus, ApprovalStatus, TaskPriority, PhotoKind } from './database.types';

/** Sanitized, login-free task shape served by /api/public/overview. */
export interface PublicTask {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  status: TaskStatus;
  approval: ApprovalStatus | null;
  priority: TaskPriority;
  assigneeName: string;
  reporter: string | null;
  assigned_date: string | null;
  due_date: string | null;
  due_text: string | null;
  completed_at: string | null;
  note: string | null;
  place: string | null;
  materials: string | null;
  time_start: string | null;
  time_end: string | null;
}

export interface PublicPhoto {
  id: string;
  kind: PhotoKind;
  url: string;
}
