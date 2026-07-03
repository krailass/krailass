'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { DecoratedTask } from '@/lib/task-view';
import { StatusPill, CategoryBadge, UrgentBadge, ApprovalBadge } from '@/components/ui/badges';
import { TaskPhotos } from '@/components/tasks/TaskPhotos';
import { fmtThaiDate, hhmm } from '@/lib/utils';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-1 text-[13px]">
      <div className="w-28 flex-none text-muted-soft">{label}</div>
      <div className="min-w-0 flex-1 font-medium text-ink">{value || '—'}</div>
    </div>
  );
}

export function TaskDetailDialog({
  task,
  onClose,
}: {
  task: DecoratedTask | null;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={task != null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] border border-line bg-card shadow-pop focus:outline-none">
          {task && (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-line p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Dialog.Title className="text-[16px] font-bold">{task.title}</Dialog.Title>
                    {task.isUrgent && <UrgentBadge />}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <CategoryBadge category={task.category} />
                    <StatusPill status={task.status} />
                    {task.approvalLabel && (
                      <ApprovalBadge label={task.approvalLabel} color={task.approvalColor!} bg={task.approvalBg!} />
                    )}
                  </div>
                </div>
                <Dialog.Close aria-label="ปิด" className="flex-none text-muted-faint hover:text-ink">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>

              <div className="overflow-y-auto p-5">
                <div className="divide-y divide-line/60">
                  <Row label="ผู้รับผิดชอบ" value={task.assigneeName} />
                  <Row label="ผู้แจ้ง" value={task.reporter || '—'} />
                  <Row label="สถานที่" value={task.location || '—'} />
                  <Row label="ประเภทงาน" value={task.category || '—'} />
                  <Row label="ความสำคัญ" value={task.priorityLabel} />
                  <Row label="กำหนดเสร็จ" value={task.due_text || fmtThaiDate(task.due_date) || '—'} />
                  <Row
                    label="วันที่มอบหมาย"
                    value={
                      task.assigned_date
                        ? `${fmtThaiDate(task.assigned_date)}${task.assigned_time ? ` เวลา ${hhmm(task.assigned_time)} น.` : ''}`
                        : '—'
                    }
                  />
                  {(task.time_start || task.time_end) && (
                    <Row label="เวลาปฏิบัติงาน" value={`${hhmm(task.time_start) || '—'}–${hhmm(task.time_end) || '—'}`} />
                  )}
                  <Row label="วัสดุอุปกรณ์" value={task.materials || '—'} />
                  {task.note && <Row label="รายละเอียด/ผล" value={task.note} />}
                </div>

                {task.status === 'done' && (
                  <div className="mt-4">
                    <div className="mb-2 text-[12.5px] font-semibold text-[#4A574F]">ภาพประกอบ</div>
                    <TaskPhotos taskId={task.id} />
                  </div>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
