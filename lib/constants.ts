import type { TaskStatus, ApprovalStatus, TaskPriority } from './database.types';

export const SCHOOL = {
  name: 'โรงเรียนสวายวิทยาคาร',
  dept: 'กลุ่มงานบริหารทั่วไป',
  system: 'ระบบจัดการงานนักการภารโรง · อาคารสถานที่',
};

/** Signatories on the official PDFs. Adjust to real names as needed. */
export const SIGNATORIES = {
  preparer: 'นางสาวกัลยา งามเลิศ', // ผู้จัดทำข้อมูล
  operator: 'นายชนินทร์ยศ มั่นหมาย', // ผู้ควบคุมและดำเนินงาน
  generalAffairsHead: 'นายศึกษา จุนเสริม', // หัวหน้ากลุ่มบริหารทั่วไป
  deputyDirector: 'นางสาวกัลยกร จันทร์ดาอ่อน', // รองผู้อำนวยการ
  director: 'นางสาวทองใบ ตลับทอง', // ผู้อำนวยการ
};

export const STATUS_META: Record<
  TaskStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: { label: 'ยังไม่ดำเนินงาน', color: '#5A6772', bg: '#EEF1F4', dot: '#94A3B8' },
  progress: { label: 'กำลังดำเนินงาน', color: '#B45309', bg: '#FDF1E1', dot: '#F59E0B' },
  done: { label: 'ดำเนินการแล้ว', color: '#0F7A45', bg: '#E4F4EC', dot: '#22C55E' },
};

export const STATUS_ORDER: TaskStatus[] = ['pending', 'progress', 'done'];

export const APPROVAL_META: Record<
  Exclude<ApprovalStatus, never>,
  { label: string; color: string; bg: string }
> = {
  waiting: { label: 'รอตรวจ', color: '#B45309', bg: '#FDF1E1' },
  approved: { label: 'อนุมัติแล้ว', color: '#0F7A45', bg: '#E4F4EC' },
};

export const PRIORITY_META: Record<TaskPriority, { label: string }> = {
  normal: { label: 'ปกติ' },
  urgent: { label: 'เร่งด่วน' },
};

/** Fallback category colors when a category is missing from the DB. */
export const DEFAULT_CATEGORY_COLOR = { bg: '#EEF1F4', text: '#5A6772' };

/** Preset color pairs for creating/editing categories. */
export const CATEGORY_PALETTE: { bg: string; text: string }[] = [
  { bg: '#EAF0FB', text: '#2456B8' },
  { bg: '#F0EDFB', text: '#6B45C4' },
  { bg: '#FBEFEA', text: '#B85526' },
  { bg: '#E7F3F6', text: '#1E7A8C' },
  { bg: '#FBF3E1', text: '#9A6B12' },
  { bg: '#E9F4E6', text: '#3B7A2E' },
  { bg: '#FDECEC', text: '#C0362C' },
  { bg: '#E4F1EF', text: '#0F766E' },
  { bg: '#EEF1F4', text: '#5A6772' },
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  ซ่อมแซม: { bg: '#EAF0FB', text: '#2456B8' },
  บำรุงรักษา: { bg: '#F0EDFB', text: '#6B45C4' },
  ปรับปรุง: { bg: '#FBEFEA', text: '#B85526' },
  ทำความสะอาด: { bg: '#E7F3F6', text: '#1E7A8C' },
  'ไฟฟ้า-ประปา': { bg: '#FBF3E1', text: '#9A6B12' },
  ดูแลภูมิทัศน์: { bg: '#E9F4E6', text: '#3B7A2E' },
};

export type SummaryPeriod = 'day' | 'week' | 'month' | 'year';

export const PERIOD_LABEL: Record<SummaryPeriod, string> = {
  day: 'ประจำวัน',
  week: 'ประจำสัปดาห์',
  month: 'ประจำเดือน',
  year: 'ประจำปี',
};

export const PERIOD_TAB: Record<SummaryPeriod, string> = {
  day: 'รายวัน',
  week: 'รายสัปดาห์',
  month: 'รายเดือน',
  year: 'รายปี',
};

export const LOGIN_EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN || 'sawai.local';

export const TASK_PHOTOS_BUCKET = 'task-photos';
