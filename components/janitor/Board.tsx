'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, Play, ClipboardCheck } from 'lucide-react';
import type { TaskStatus } from '@/lib/database.types';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { advanceTask, type SB } from '@/lib/api';
import { notify } from '@/lib/notify';
import { useTasks, qk } from '@/hooks/useAppData';
import { useProfile } from '@/components/layout/ProfileContext';
import { Card, Button } from '@/components/ui/primitives';
import { CategoryBadge, UrgentBadge, ApprovalBadge } from '@/components/ui/badges';
import { Loading, ErrorBox } from '@/components/ui/states';
import { STATUS_ORDER, STATUS_META } from '@/lib/constants';
import { fmtThaiDate } from '@/lib/utils';
import type { DecoratedTask } from '@/lib/task-view';

type Scope = 'mine' | 'all';

export function Board() {
  const { userId } = useProfile();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: tasks, isLoading, error } = useTasks();
  const [scope, setScope] = React.useState<Scope>('mine');

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const all = tasks ?? [];
  const visible = scope === 'mine' ? all.filter((t) => t.assignee_id === userId) : all;

  async function start(t: DecoratedTask) {
    try {
      await advanceTask(getSupabaseBrowser() as SB, t.id);
      await qc.invalidateQueries({ queryKey: qk.tasks });
      notify({ target: { role: 'admin' }, title: 'นักการเริ่มดำเนินงาน', body: t.title, taskId: t.id, type: 'started' });
      toast.success('เริ่มดำเนินการแล้ว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    }
  }

  return (
    <div className="animate-fadeUp">
      <div className="mb-4 inline-flex rounded-full border border-line bg-card p-1" data-noprint>
        {(['mine', 'all'] as Scope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              scope === s ? 'bg-brand text-white' : 'text-[#5A6772]'
            }`}
          >
            {s === 'mine' ? 'งานของฉัน' : 'งานทั้งหมด'}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-3.5 md:grid-cols-3">
        {STATUS_ORDER.map((status) => {
          const items = visible.filter((t) => t.status === status);
          return (
            <div key={status} className="rounded-card border border-line bg-[#F5F7F3] p-3.5">
              <div className="flex items-center justify-between px-1.5 pb-3">
                <div className="text-[13.5px] font-bold">{STATUS_META[status].label}</div>
                <div className="rounded-full border border-line bg-card px-2.5 py-0.5 text-[12px] font-bold text-[#5A6772]">
                  {items.length}
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((t) => (
                  <BoardCard
                    key={t.id}
                    task={t}
                    mine={t.assignee_id === userId}
                    onStart={() => start(t)}
                    onReport={() => router.push(`/janitor/report?task=${t.id}`)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="py-6 text-center text-[12px] text-muted-faint">— ไม่มีงาน —</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BoardCard({
  task: t,
  mine,
  onStart,
  onReport,
}: {
  task: DecoratedTask;
  mine: boolean;
  onStart: () => void;
  onReport: () => void;
}) {
  return (
    <Card className="p-3.5">
      <div className="mb-2 flex flex-wrap gap-2">
        <CategoryBadge category={t.category} />
        {t.isUrgent && <UrgentBadge />}
      </div>
      <div className="text-sm font-semibold leading-snug">{t.title}</div>
      <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-soft">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        <span>{t.location || '—'}</span>
        <span className="ml-auto">กำหนด {t.due_text || fmtThaiDate(t.due_date) || '—'}</span>
      </div>
      {!mine && <div className="mt-1.5 text-[11.5px] text-muted-faint">ผู้รับผิดชอบ {t.assigneeName}</div>}
      {t.reporter && <div className="mt-1 text-[11.5px] text-muted-faint">แจ้งโดย {t.reporter}</div>}
      {t.approvalLabel && (
        <div className="mt-2.5">
          <ApprovalBadge label={t.approvalLabel} color={t.approvalColor!} bg={t.approvalBg!} />
        </div>
      )}
      {mine && t.status !== 'done' && (
        <Button
          size="sm"
          block
          className="mt-2.5"
          onClick={t.status === 'pending' ? onStart : onReport}
        >
          {t.status === 'pending' ? (
            <>
              <Play className="h-4 w-4" aria-hidden />
              เริ่มดำเนินการ
            </>
          ) : (
            <>
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              บันทึกผล / ส่งรายงาน
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
