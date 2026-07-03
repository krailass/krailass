'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, MapPin } from 'lucide-react';
import type { DecoratedTask } from '@/lib/task-view';
import { Card } from '@/components/ui/primitives';
import { StatusPill, CategoryBadge, UrgentBadge } from '@/components/ui/badges';
import { useCategories } from '@/hooks/useAppData';
import { categoryColor, givenName, toISODate, periodRange } from '@/lib/utils';

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
// Urgent tasks are shown dark red regardless of category.
const URGENT = { bg: '#FEE2E2', text: '#B91C1C' };
const colorOf = (t: DecoratedTask) => (t.isUrgent ? URGENT : categoryColor(t.category));

function taskDate(t: DecoratedTask): string | null {
  return t.assigned_date || t.due_date;
}

export function TasksCalendar({
  tasks,
  onSelectTask,
}: {
  tasks: DecoratedTask[];
  onSelectTask?: (t: DecoratedTask) => void;
}) {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const today = React.useMemo(() => toISODate(new Date()), []);
  const [monthRef, setMonthRef] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState(today);

  const year = monthRef.getFullYear();
  const month = monthRef.getMonth();

  const byDate = React.useMemo(() => {
    const m = new Map<string, DecoratedTask[]>();
    for (const t of tasks) {
      const d = taskDate(t);
      if (!d) continue;
      const key = d.slice(0, 10);
      const arr = m.get(key);
      if (arr) arr.push(t);
      else m.set(key, [t]);
    }
    return m;
  }, [tasks]);

  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta: number) => setMonthRef(new Date(year, month + delta, 1));
  const selectedTasks = byDate.get(selected) ?? [];

  return (
    <div className="animate-fadeUp">
      <Card className="overflow-hidden p-3 sm:p-4">
        {/* Month nav */}
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="เดือนก่อนหน้า"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card text-[#5A6772] hover:bg-canvas"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-[14px] font-bold sm:text-[15px]">
              {periodRange('month', monthRef).replace('เดือน', '')}
            </div>
            <button
              onClick={() => {
                setMonthRef(new Date());
                setSelected(today);
              }}
              className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-semibold text-[#5A6772]"
            >
              วันนี้
            </button>
          </div>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="เดือนถัดไป"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card text-[#5A6772] hover:bg-canvas"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-line pb-1 text-center text-[11px] font-semibold text-muted-soft">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day == null) return <div key={i} className="min-h-[58px] border-b border-r border-line/60 bg-[#FAFBF9]" />;
            const iso = toISODate(new Date(year, month, day));
            const dayTasks = byDate.get(iso) ?? [];
            const isToday = iso === today;
            const isSel = iso === selected;
            return (
              <button
                key={i}
                onClick={() => setSelected(iso)}
                className={`min-h-[58px] border-b border-r border-line/60 p-1 text-left align-top transition-colors sm:min-h-[74px] ${
                  isSel ? 'bg-[#E4F1EF]' : 'hover:bg-canvas'
                }`}
              >
                <div
                  className={`mb-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    isToday ? 'bg-brand text-white' : isSel ? 'text-brand' : 'text-ink'
                  }`}
                >
                  {day}
                </div>
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, 3).map((t) => {
                    const c = colorOf(t);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-1 overflow-hidden rounded-[4px] px-1 py-px"
                        style={{ background: c.bg }}
                      >
                        <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: c.text }} />
                        <span className="truncate text-[9px] font-medium" style={{ color: c.text }}>
                          {givenName(t.assigneeName)}
                        </span>
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <span className="pl-1 text-[9px] font-semibold text-muted-faint">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Color legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
          {categories.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5 text-[11px] text-[#4A574F]">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color_text }} />
              {c.name}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4A574F]">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: URGENT.text }} />
            เร่งด่วน
          </span>
        </div>
      </Card>

      {/* Selected-day detail */}
      <Card className="mt-4 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[14px] font-bold">
            งานวันที่ {new Date(selected).getDate()} {periodRange('month', new Date(selected)).replace('เดือน', '')}
            <span className="ml-2 text-[12px] font-medium text-muted-soft">({selectedTasks.length} งาน)</span>
          </div>
          <button
            onClick={() => router.push(`/admin/assign?date=${selected}`)}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" aria-hidden />
            มอบหมายงานในวันนี้
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <button
            onClick={() => router.push(`/admin/assign?date=${selected}`)}
            className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-line bg-[#F8FAF7] py-8 text-muted-faint hover:bg-canvas"
          >
            <Plus className="h-5 w-5" aria-hidden />
            <span className="text-[12.5px] font-medium">ยังไม่มีงานในวันนี้ — แตะเพื่อมอบหมายงาน</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            {selectedTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTask?.(t)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#EEF1EC] px-3 py-2.5 text-left hover:bg-canvas"
              >
                <span
                  className="h-9 w-1.5 flex-none rounded-full"
                  style={{ background: t.isUrgent ? URGENT.text : t.catText }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-semibold">{t.title}</span>
                    {t.isUrgent && <UrgentBadge />}
                    <CategoryBadge category={t.category} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-soft">
                    <span>{t.assigneeName}</span>
                    <MapPin className="h-3 w-3 text-muted-faint" aria-hidden />
                    <span>{t.location || '—'}</span>
                  </div>
                </div>
                <StatusPill status={t.status} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
