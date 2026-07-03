'use client';

import * as React from 'react';
import { useJanitors, useTasks } from '@/hooks/useAppData';
import { Card } from '@/components/ui/primitives';
import { Select } from '@/components/ui/form';
import { Loading } from '@/components/ui/states';
import { SummaryPdfButton } from '@/components/pdf/SummaryPdfButton';
import { inPeriod, periodRange, pct } from '@/lib/utils';
import { PERIOD_TAB, PERIOD_LABEL, type SummaryPeriod } from '@/lib/constants';

const PERIODS: SummaryPeriod[] = ['day', 'week', 'month', 'year'];

export function PersonSummaryReport() {
  const { data: janitors, isLoading } = useJanitors();
  const { data: tasks = [] } = useTasks();
  const [janitorId, setJanitorId] = React.useState('');
  const [period, setPeriod] = React.useState<SummaryPeriod>('month');
  const ref = React.useMemo(() => new Date(), []);

  if (isLoading) return <Loading />;

  const list = janitors ?? [];
  const selected = list.find((j) => j.id === janitorId) || list[0];
  const mine = selected ? tasks.filter((t) => t.assignee_id === selected.id) : [];
  const periodTasks = mine.filter((t) => inPeriod(t.assigned_date || t.due_date, period, ref));
  const done = periodTasks.filter((t) => t.status === 'done').length;

  return (
    <Card className="p-5">
      <div className="mb-1 text-[15px] font-bold">สรุปผลการปฏิบัติงานรายบุคคล (PDF)</div>
      <div className="mb-4 text-[12.5px] text-muted-soft">
        เลือกนักการและช่วงเวลา แล้วออกเอกสารสรุป รายวัน / สัปดาห์ / เดือน / ปี
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selected?.id ?? ''}
          onChange={(e) => setJanitorId(e.target.value)}
          className="min-w-[200px] flex-1"
        >
          {list.map((j) => (
            <option key={j.id} value={j.id}>
              {j.full_name}
            </option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                period === p ? 'border-brand bg-brand text-white' : 'border-line bg-card text-[#5A6772]'
              }`}
            >
              {PERIOD_TAB[p]}
            </button>
          ))}
        </div>
        {selected && (
          <SummaryPdfButton
            profile={selected}
            period={period}
            periodLabel={PERIOD_LABEL[period]}
            rangeText={periodRange(period, ref)}
            tasks={periodTasks}
          />
        )}
      </div>

      {selected && (
        <div className="mt-3 flex flex-wrap gap-4 text-[12.5px] text-muted">
          <span>ช่วง: {PERIOD_LABEL[period]} ({periodRange(period, ref)})</span>
          <span>
            งานในช่วงนี้ <b className="text-ink">{periodTasks.length}</b> · เสร็จ{' '}
            <b className="text-status-done">{done}</b> · สำเร็จ{' '}
            <b className="text-brand">{pct(done, periodTasks.length)}%</b>
          </span>
        </div>
      )}
    </Card>
  );
}
