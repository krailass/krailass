'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import type { TaskStatus } from '@/lib/database.types';
import type { DecoratedTask } from '@/lib/task-view';
import { Card, Avatar, EmptyState } from '@/components/ui/primitives';
import { StatusPill, CategoryBadge, UrgentBadge } from '@/components/ui/badges';
import { FilterTabs } from '@/components/ui/states';
import { fmtThaiDate } from '@/lib/utils';

type Filter = 'all' | TaskStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'pending', label: 'ยังไม่ดำเนินงาน' },
  { key: 'progress', label: 'กำลังดำเนินงาน' },
  { key: 'done', label: 'ดำเนินการแล้ว' },
];

export function TasksTable({
  tasks,
  onSelectTask,
}: {
  tasks: DecoratedTask[];
  onSelectTask?: (t: DecoratedTask) => void;
}) {
  const [filter, setFilter] = React.useState<Filter>('all');
  const rows = tasks.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="animate-fadeUp">
      <FilterTabs value={filter} options={FILTERS} onChange={setFilter} />

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[2.4fr_1.3fr_1.3fr_1.2fr] gap-3 border-b border-line bg-[#F5F7F3] px-[18px] py-3 text-[11.5px] font-bold text-muted md:grid">
          <div>งาน</div>
          <div>ผู้รับผิดชอบ</div>
          <div>สถานที่ / กำหนด</div>
          <div>สถานะ</div>
        </div>

        {rows.length === 0 && <EmptyState title="ไม่พบงานในเงื่อนไขนี้" />}

        {rows.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTask?.(t)}
            className="grid w-full grid-cols-1 items-center gap-2 border-b border-[#F1F4EF] px-4 py-3.5 text-left last:border-b-0 hover:bg-canvas md:grid-cols-[2.4fr_1.3fr_1.3fr_1.2fr] md:gap-3 md:px-[18px]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13.5px] font-semibold">{t.title}</span>
                {t.isUrgent && <UrgentBadge />}
              </div>
              <div className="mt-1.5">
                <CategoryBadge category={t.category} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar name={t.assigneeName} initial={t.assigneeInitial} size={28} />
              <span className="text-[12.5px] text-[#4A574F]">{t.assigneeName}</span>
            </div>
            <div className="text-[12.5px] text-[#5A6772]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-muted-faint" aria-hidden />
                {t.location || '—'}
              </span>
              <div className="text-[11px] text-muted-faint">
                กำหนด {t.due_text || fmtThaiDate(t.due_date) || '—'}
              </div>
            </div>
            <div>
              <StatusPill status={t.status} />
            </div>
          </button>
        ))}
      </Card>
    </div>
  );
}
