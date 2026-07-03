import { clsx, type ClassValue } from 'clsx';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, type SummaryPeriod } from './constants';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

const THAI_PREFIX_RE = /^(นางสาว|นาย|นาง|เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.)/;

/** First visible character of a name (prefix stripped) for avatar initials. */
export function initial(name: string | null | undefined): string {
  const trimmed = (name || '').replace(THAI_PREFIX_RE, '').trim();
  return trimmed.charAt(0) || '•';
}

/** Given (first) name with the honorific prefix stripped, e.g. "นายสมชาย ใจดี" -> "สมชาย". */
export function givenName(name: string | null | undefined): string {
  const trimmed = (name || '').replace(THAI_PREFIX_RE, '').trim();
  return trimmed.split(/\s+/)[0] || '';
}

/** Local YYYY-MM-DD (avoids UTC shift from toISOString on date-only values). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];
const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

/** '2026-06-30' -> '30 มิ.ย. 69' (Buddhist era, 2 digits). */
export function fmtThaiDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${(d.getFullYear() + 543) % 100}`;
}

/** '2026-06-30' -> '30 มิถุนายน 2569' (full Buddhist era). */
export function fmtThaiDateFull(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || '';
  return `${d.getDate()} ${THAI_MONTHS_FULL[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function categoryColor(name: string | null | undefined): { bg: string; text: string } {
  if (!name) return DEFAULT_CATEGORY_COLOR;
  return CATEGORY_COLORS[name] || DEFAULT_CATEGORY_COLOR;
}

/** Whether an ISO date falls within the period relative to a reference date. */
export function inPeriod(iso: string | null, period: SummaryPeriod, ref: Date): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  if (period === 'day') return d.toDateString() === ref.toDateString();
  if (period === 'week') {
    const diff = (ref.getTime() - d.getTime()) / 86_400_000;
    return diff >= 0 && diff <= 6;
  }
  if (period === 'month') {
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  }
  return d.getFullYear() === ref.getFullYear();
}

/** Human range text for the summary header. */
export function periodRange(period: SummaryPeriod, ref: Date): string {
  if (period === 'day') return fmtThaiDateFull(ref.toISOString().slice(0, 10));
  if (period === 'week') {
    const start = new Date(ref);
    start.setDate(ref.getDate() - 6);
    return `${fmtThaiDateFull(start.toISOString().slice(0, 10))} – ${fmtThaiDateFull(
      ref.toISOString().slice(0, 10),
    )}`;
  }
  if (period === 'month') return `เดือน${THAI_MONTHS_FULL[ref.getMonth()]} ${ref.getFullYear() + 543}`;
  return `ปี พ.ศ. ${ref.getFullYear() + 543}`;
}

export function pct(n: number, total: number): number {
  return total ? Math.round((n / total) * 100) : 0;
}

/** "HH:MM:SS" -> "HH:MM" (drops seconds). Returns '' for empty. */
export function hhmm(t: string | null | undefined): string {
  if (!t) return '';
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : t;
}

/** '2026-06-30' -> 'วันที่ 30 เดือน มิถุนายน พ.ศ. 2569' for the official report header. */
export function fmtOfficialDate(iso: string | null | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  const ref = Number.isNaN(d.getTime()) ? new Date() : d;
  return `วันที่ ${ref.getDate()} เดือน ${THAI_MONTHS_FULL[ref.getMonth()]} พ.ศ. ${ref.getFullYear() + 543}`;
}

/** username -> synthetic email for Supabase Auth. */
export function usernameToEmail(username: string, domain: string): string {
  const u = username.trim().toLowerCase().replace(/\s+/g, '');
  return u.includes('@') ? u : `${u}@${domain}`;
}
