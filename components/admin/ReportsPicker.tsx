'use client';

import * as React from 'react';
import { useTasks } from '@/hooks/useAppData';
import { Card } from '@/components/ui/primitives';
import { Select } from '@/components/ui/form';
import { StatusPill, CategoryBadge } from '@/components/ui/badges';
import { Loading, ErrorBox } from '@/components/ui/states';
import { TaskPhotos } from '@/components/tasks/TaskPhotos';
import { TaskReportButton } from '@/components/pdf/TaskReportButton';

export function ReportsPicker() {
  const { data: tasks, isLoading, error } = useTasks();
  const [id, setId] = React.useState<string>('');

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const all = tasks ?? [];
  const selected = all.find((t) => t.id === id) || all[0];

  return (
    <div className="animate-fadeUp">
      <Card className="mb-4 flex flex-wrap items-center gap-3 p-4" data-noprint>
        <span className="text-[13px] font-semibold text-[#4A574F]">เลือกงานเพื่อออกรายงาน:</span>
        <Select
          value={selected?.id ?? ''}
          onChange={(e) => setId(e.target.value)}
          className="min-w-[220px] flex-1"
        >
          {all.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} — {t.assigneeName}
            </option>
          ))}
        </Select>
        {selected && <TaskReportButton task={selected} />}
      </Card>

      {selected && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-lg font-bold">{selected.title}</div>
            <CategoryBadge category={selected.category} />
            <StatusPill status={selected.status} />
          </div>
          <div className="mt-1 text-[13px] text-muted-soft">
            {selected.assigneeName} · {selected.location || '—'}
            {selected.reporter ? ` · แจ้งโดย ${selected.reporter}` : ''}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-[#5A6772]">
            <div>
              <span className="text-muted-faint">เวลา</span> {selected.time_start || '—'}
              {selected.time_end ? `–${selected.time_end}` : ''}
            </div>
            <div>
              <span className="text-muted-faint">วัสดุ</span> {selected.materials || '—'}
            </div>
          </div>
          {selected.note && (
            <div className="mt-2 text-[13px] leading-relaxed text-[#5A6772]">{selected.note}</div>
          )}
          <div className="mt-4">
            <TaskPhotos taskId={selected.id} />
          </div>
        </Card>
      )}
    </div>
  );
}
