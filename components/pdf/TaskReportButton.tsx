'use client';

import * as React from 'react';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { fetchTaskPhotos, type SB } from '@/lib/api';
import { Button } from '@/components/ui/primitives';
import { downloadBlob, urlToDataUrl } from '@/lib/pdf/download';
import { SCHOOL, SIGNATORIES } from '@/lib/constants';
import { fmtOfficialDate, fmtThaiDateFull } from '@/lib/utils';
import type { DecoratedTask } from '@/lib/task-view';

export function TaskReportButton({ task }: { task: DecoratedTask }) {
  const [busy, setBusy] = React.useState(false);

  async function make() {
    setBusy(true);
    try {
      const sb = getSupabaseBrowser() as SB;
      const photos = await fetchTaskPhotos(sb, task.id);
      const beforeUrls = (
        await Promise.all(photos.filter((p) => p.kind === 'before').map((p) => urlToDataUrl(p.url)))
      ).filter((u): u is string => !!u);
      const afterUrls = (
        await Promise.all(photos.filter((p) => p.kind === 'after').map((p) => urlToDataUrl(p.url)))
      ).filter((u): u is string => !!u);

      const [{ pdf }, { TaskReportDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./documents'),
      ]);

      const doc = (
        <TaskReportDocument
          school={SCHOOL.name}
          dept={SCHOOL.dept}
          dateText={fmtOfficialDate(task.completed_at || task.assigned_date)}
          assigneeName={task.assigneeName}
          reporter={task.reporter || ''}
          location={task.location || ''}
          title={task.title}
          materials={task.materials || ''}
          timeStart={task.time_start || ''}
          timeEnd={task.time_end || ''}
          assignDateText={fmtThaiDateFull(task.assigned_date)}
          assignTimeText={task.assigned_time || ''}
          statusDone={task.status === 'done'}
          statusProgress={task.status === 'progress'}
          beforeImgs={beforeUrls}
          afterImgs={afterUrls}
          signatories={SIGNATORIES}
        />
      );
      const blob = await pdf(doc).toBlob();
      downloadBlob(blob, `รายงานการปฏิบัติงาน-${task.title}.pdf`);
    } catch (e) {
      toast.error('สร้าง PDF ไม่สำเร็จ: ' + (e instanceof Error ? e.message : ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={make} loading={busy}>
      <Printer className="h-4 w-4" aria-hidden />
      พิมพ์ / บันทึก PDF
    </Button>
  );
}
