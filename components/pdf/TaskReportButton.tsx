'use client';

import * as React from 'react';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { type SB } from '@/lib/api';
import { Button } from '@/components/ui/primitives';
import { downloadBlob } from '@/lib/pdf/download';
import { buildTaskReportProps } from '@/lib/pdf/task-report';
import type { DecoratedTask } from '@/lib/task-view';

export function TaskReportButton({ task }: { task: DecoratedTask }) {
  const [busy, setBusy] = React.useState(false);

  async function make() {
    setBusy(true);
    try {
      const sb = getSupabaseBrowser() as SB;
      const props = await buildTaskReportProps(sb, task);

      const [{ pdf }, { TaskReportDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./documents'),
      ]);

      const blob = await pdf(<TaskReportDocument {...props} />).toBlob();
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
