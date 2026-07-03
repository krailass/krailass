import * as React from 'react';
import type { TaskStatus } from '@/lib/database.types';
import { STATUS_META } from '@/lib/constants';
import { categoryColor } from '@/lib/utils';

export function StatusPill({ status }: { status: TaskStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
      style={{ background: m.bg, color: m.color }}
    >
      <span className="h-[7px] w-[7px] rounded-full" style={{ background: m.dot }} aria-hidden />
      {m.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null;
  const c = categoryColor(category);
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      {category}
    </span>
  );
}

export function UrgentBadge() {
  return (
    <span className="rounded-full bg-urgent-bg px-2 py-0.5 text-[10px] font-bold text-urgent">
      เร่งด่วน
    </span>
  );
}

export function ApprovalBadge({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="inline-block rounded-lg px-2.5 py-1 text-[11.5px] font-semibold"
      style={{ background: bg, color }}
    >
      สถานะ: {label}
    </span>
  );
}
