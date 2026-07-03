'use client';

import * as React from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/primitives';
import { downloadBlob } from '@/lib/pdf/download';
import { SCHOOL, SIGNATORIES, STATUS_META, type SummaryPeriod } from '@/lib/constants';
import { fmtThaiDate, pct } from '@/lib/utils';
import type { DecoratedTask } from '@/lib/task-view';
import type { ProfileRow } from '@/lib/database.types';

export function SummaryPdfButton({
  profile,
  period,
  periodLabel,
  rangeText,
  tasks,
}: {
  profile: ProfileRow;
  period: SummaryPeriod;
  periodLabel: string;
  rangeText: string;
  tasks: DecoratedTask[];
}) {
  const [busy, setBusy] = React.useState(false);

  async function make() {
    setBusy(true);
    try {
      const [{ pdf }, { PersonSummaryDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./documents'),
      ]);
      const done = tasks.filter((t) => t.status === 'done').length;
      const progress = tasks.filter((t) => t.status === 'progress').length;
      const pending = tasks.filter((t) => t.status === 'pending').length;
      const rows = tasks.map((t, i) => ({
        no: i + 1,
        title: t.title,
        category: t.category || '',
        dateText: fmtThaiDate(t.assigned_date || t.due_date) || '—',
        statusLabel: STATUS_META[t.status].label,
      }));
      const doc = (
        <PersonSummaryDocument
          school={SCHOOL.name}
          dept={SCHOOL.dept}
          name={profile.full_name}
          zone={profile.zone || ''}
          periodLabel={periodLabel}
          rangeText={rangeText}
          stats={{ total: tasks.length, done, progress, pending, pct: pct(done, tasks.length) }}
          rows={rows}
          signatories={SIGNATORIES}
        />
      );
      const blob = await pdf(doc).toBlob();
      downloadBlob(blob, `สรุปการปฏิบัติงาน-${profile.full_name}-${periodLabel}.pdf`);
    } catch (e) {
      toast.error('สร้าง PDF ไม่สำเร็จ: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setBusy(false);
    }
  }

  // period is included so the button re-renders label when it changes upstream
  void period;

  return (
    <Button onClick={make} loading={busy} size="sm">
      <FileDown className="h-4 w-4" aria-hidden />
      พิมพ์ / บันทึก PDF
    </Button>
  );
}
