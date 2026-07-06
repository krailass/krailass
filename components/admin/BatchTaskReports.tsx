'use client';

import * as React from 'react';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { type SB } from '@/lib/api';
import { useJanitors, useTasks } from '@/hooks/useAppData';
import { Card, Button } from '@/components/ui/primitives';
import { Select } from '@/components/ui/form';
import { Loading } from '@/components/ui/states';
import { downloadBlob } from '@/lib/pdf/download';
import { buildTaskReportProps } from '@/lib/pdf/task-report';
import { inPeriod, periodRange } from '@/lib/utils';
import { PERIOD_TAB, PERIOD_LABEL, type SummaryPeriod } from '@/lib/constants';

const PERIODS: SummaryPeriod[] = ['day', 'week', 'month', 'year'];

// Batch-print the official per-task reports for one janitor over a selected
// period — every matching task becomes a page in a single PDF.
export function BatchTaskReports() {
  const { data: janitors, isLoading } = useJanitors();
  const { data: tasks = [] } = useTasks();
  const [janitorId, setJanitorId] = React.useState('');
  const [period, setPeriod] = React.useState<SummaryPeriod>('month');
  const [busy, setBusy] = React.useState(false);
  const ref = React.useMemo(() => new Date(), []);

  if (isLoading) return <Loading />;

  const list = janitors ?? [];
  const selected = list.find((j) => j.id === janitorId) || list[0];
  const mine = selected ? tasks.filter((t) => t.assignee_id === selected.id) : [];
  const periodTasks = mine.filter((t) => inPeriod(t.assigned_date || t.due_date, period, ref));

  async function make() {
    if (!selected || periodTasks.length === 0) return;
    setBusy(true);
    try {
      const sb = getSupabaseBrowser() as SB;
      const items = await Promise.all(periodTasks.map((t) => buildTaskReportProps(sb, t)));
      const [{ pdf }, { BatchTaskReportDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/documents'),
      ]);
      const blob = await pdf(<BatchTaskReportDocument items={items} />).toBlob();
      downloadBlob(blob, `รายงานการปฏิบัติงาน-${selected.full_name}-${PERIOD_LABEL[period]}.pdf`);
    } catch (e) {
      toast.error('สร้าง PDF ไม่สำเร็จ: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-1 text-[15px] font-bold">พิมพ์รายงานย้อนหลังหลายงาน (PDF)</div>
      <div className="mb-4 text-[12.5px] text-muted-soft">
        เลือกนักการและช่วงเวลา แล้วออกรายงานการปฏิบัติงานฉบับทางการของทุกงานในช่วงนั้นเป็นไฟล์เดียว (งานละ 1 หน้า)
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
        <Button onClick={make} loading={busy} disabled={periodTasks.length === 0}>
          <Printer className="h-4 w-4" aria-hidden />
          พิมพ์ทั้งหมด ({periodTasks.length} งาน)
        </Button>
      </div>

      <div className="mt-3 text-[12.5px] text-muted-soft">
        ช่วง: {PERIOD_LABEL[period]} ({periodRange(period, ref)}) ·{' '}
        {periodTasks.length > 0 ? `${periodTasks.length} งานในช่วงนี้` : 'ไม่มีงานในช่วงนี้'}
      </div>
    </Card>
  );
}
