'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Undo2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { approveTask, sendBackTask } from '@/lib/api';
import { notify } from '@/lib/notify';
import { useTasks, qk } from '@/hooks/useAppData';
import { useProfile } from '@/components/layout/ProfileContext';
import { useConfirm } from '@/components/ui/confirm';
import { Card, Button, EmptyState } from '@/components/ui/primitives';
import { Loading, ErrorBox } from '@/components/ui/states';
import { TaskPhotos } from '@/components/tasks/TaskPhotos';
import { inPeriod, periodRange } from '@/lib/utils';

type Filter = 'all' | 'waiting' | 'approved';

export function ApproveQueue() {
  const { userId } = useProfile();
  const { data: tasks, isLoading, error } = useTasks();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [filter, setFilter] = React.useState<Filter>('all');
  const [monthRef, setMonthRef] = React.useState(() => new Date());

  const refresh = () => qc.invalidateQueries({ queryKey: qk.tasks });

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const shiftMonth = (delta: number) =>
    setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));

  // Done tasks within the selected month (by completion/assigned/due date).
  const inMonth = (tasks ?? [])
    .filter((t) => t.status === 'done')
    .filter((t) =>
      inPeriod((t.completed_at ? t.completed_at.slice(0, 10) : t.assigned_date || t.due_date), 'month', monthRef),
    );

  const waitingN = inMonth.filter((t) => t.approval === 'waiting').length;
  const approvedN = inMonth.filter((t) => t.approval === 'approved').length;

  const cards: { key: Filter; label: string; n: number; color: string; bg: string }[] = [
    { key: 'all', label: 'ทั้งหมด', n: inMonth.length, color: '#0F766E', bg: '#E4F1EF' },
    { key: 'waiting', label: 'รอตรวจ', n: waitingN, color: '#B45309', bg: '#FDF1E1' },
    { key: 'approved', label: 'อนุมัติแล้ว', n: approvedN, color: '#0F7A45', bg: '#E4F4EC' },
  ];

  const queue = inMonth.filter((t) => filter === 'all' || t.approval === filter);

  async function approve(id: string, assigneeId: string | null, title: string) {
    try {
      await approveTask(getSupabaseBrowser(), id, userId);
      await refresh();
      if (assigneeId)
        notify({ target: { userId: assigneeId }, title: 'งานได้รับการอนุมัติ', body: title, taskId: id, type: 'approved' });
      toast.success('อนุมัติงานเรียบร้อย');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'อนุมัติไม่สำเร็จ');
    }
  }

  async function back(id: string, assigneeId: string | null, title: string) {
    const ok = await confirm({
      title: 'ตีกลับให้แก้ไข',
      description: 'งานจะถูกส่งกลับไปสถานะกำลังดำเนินงานเพื่อให้นักการแก้ไขและรายงานใหม่',
      confirmText: 'ตีกลับ',
    });
    if (!ok) return;
    try {
      await sendBackTask(getSupabaseBrowser(), id);
      await refresh();
      if (assigneeId)
        notify({ target: { userId: assigneeId }, title: 'งานถูกตีกลับให้แก้ไข', body: title, taskId: id, type: 'sentback' });
      toast.success('ตีกลับให้แก้ไขแล้ว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    }
  }

  return (
    <div className="animate-fadeUp">
      {/* Month selector */}
      <div className="mb-4 flex items-center justify-between gap-2" data-noprint>
        <button
          onClick={() => shiftMonth(-1)}
          aria-label="เดือนก่อนหน้า"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card text-[#5A6772] hover:bg-canvas"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-[14px] font-bold">รายงานผล{periodRange('month', monthRef)}</div>
        <button
          onClick={() => shiftMonth(1)}
          aria-label="เดือนถัดไป"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-card text-[#5A6772] hover:bg-canvas"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Summary cards (tap to filter) */}
      <div className="mb-4 grid grid-cols-3 gap-2.5" data-noprint>
        {cards.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`rounded-card border p-3 text-left transition-colors ${
                active ? 'border-brand ring-2 ring-brand/20' : 'border-line'
              }`}
              style={{ background: active ? c.bg : '#fff' }}
            >
              <div className="text-2xl font-bold" style={{ color: c.color }}>
                {c.n}
              </div>
              <div className="text-[12px] font-semibold text-muted">{c.label}</div>
            </button>
          );
        })}
      </div>

      {queue.length === 0 ? (
        <EmptyState title="ไม่มีงานในเงื่อนไขนี้" hint="ลองเปลี่ยนเดือนหรือตัวกรองด้านบน" />
      ) : (
        <div className="flex flex-col gap-3.5">
          {queue.map((t) => (
            <Card key={t.id} className="p-[18px]">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row" style={{ minWidth: 240 }}>
                  <TaskPhotos taskId={t.id} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-bold">{t.title}</div>
                    <div className="mt-0.5 text-[12.5px] text-muted-soft">
                      {t.assigneeName} · {t.location || '—'}
                    </div>
                    {t.reporter && (
                      <div className="mt-0.5 text-[12px] text-muted-faint">แจ้งโดย {t.reporter}</div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-[12.5px] text-[#5A6772]">
                      <div>
                        <span className="text-muted-faint">เวลา</span> {t.time_start || '—'}
                        {t.time_end ? `–${t.time_end}` : ''}
                      </div>
                      <div>
                        <span className="text-muted-faint">วัสดุ</span> {t.materials || '—'}
                      </div>
                    </div>
                    {t.note && (
                      <div className="mt-2 text-[12.5px] leading-relaxed text-[#5A6772]">{t.note}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-none flex-col justify-center gap-2.5" style={{ minWidth: 150 }}>
                  <span
                    className="rounded-lg px-3 py-1.5 text-center text-[12px] font-semibold"
                    style={{ background: t.approvalBg ?? '#EEF1F4', color: t.approvalColor ?? '#5A6772' }}
                  >
                    {t.approvalLabel ?? 'รอตรวจ'}
                  </span>
                  {t.approval === 'waiting' && (
                    <>
                      <Button variant="success" size="sm" onClick={() => approve(t.id, t.assignee_id, t.title)}>
                        <Check className="h-4 w-4" aria-hidden />
                        อนุมัติงาน
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => back(t.id, t.assignee_id, t.title)}>
                        <Undo2 className="h-4 w-4" aria-hidden />
                        ตีกลับให้แก้ไข
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
