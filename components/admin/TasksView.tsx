'use client';

import * as React from 'react';
import { CalendarDays, List } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { deleteTask, type SB } from '@/lib/api';
import { useTasks, useJanitors, qk } from '@/hooks/useAppData';
import type { DecoratedTask } from '@/lib/task-view';
import { useConfirm } from '@/components/ui/confirm';
import { Loading, ErrorBox } from '@/components/ui/states';
import { Select } from '@/components/ui/form';
import { TasksCalendar } from './TasksCalendar';
import { TasksTable } from './TasksTable';
import { EditTaskDialog } from './EditTaskDialog';
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog';

type View = 'calendar' | 'list';

export function TasksView() {
  const { data: tasks, isLoading, error } = useTasks();
  const { data: janitors = [] } = useJanitors();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [view, setView] = React.useState<View>('calendar');
  const [assignee, setAssignee] = React.useState('all');
  const [detail, setDetail] = React.useState<DecoratedTask | null>(null);
  const [editing, setEditing] = React.useState<DecoratedTask | null>(null);

  async function handleDelete(t: DecoratedTask) {
    const ok = await confirm({
      title: 'ลบงานนี้',
      description: `ต้องการลบงาน "${t.title}" ใช่หรือไม่? งานและรูปภาพที่เกี่ยวข้องจะถูกลบถาวร`,
      confirmText: 'ลบงาน',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await deleteTask(getSupabaseBrowser() as SB, t.id);
      await qc.invalidateQueries({ queryKey: qk.tasks });
      toast.success('ลบงานแล้ว');
      setDetail(null);
    } catch (e) {
      toast.error('ลบไม่สำเร็จ: ' + (e instanceof Error ? e.message : 'ข้อผิดพลาด'));
    }
  }

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const filtered =
    assignee === 'all' ? (tasks ?? []) : (tasks ?? []).filter((t) => t.assignee_id === assignee);

  return (
    <div className="animate-fadeUp">
      <div className="mb-4 flex flex-wrap items-center gap-2" data-noprint>
        <Select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="min-w-[180px] flex-1 sm:max-w-[260px]"
        >
          <option value="all">นักการทุกคน</option>
          {janitors.map((j) => (
            <option key={j.id} value={j.id}>
              {j.full_name}
            </option>
          ))}
        </Select>

        <div className="inline-flex rounded-[11px] border border-line bg-card p-1">
          <button
            onClick={() => setView('calendar')}
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              view === 'calendar' ? 'bg-brand text-white' : 'text-[#5A6772]'
            }`}
          >
            <CalendarDays className="h-4 w-4" aria-hidden />
            ปฏิทิน
          </button>
          <button
            onClick={() => setView('list')}
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              view === 'list' ? 'bg-brand text-white' : 'text-[#5A6772]'
            }`}
          >
            <List className="h-4 w-4" aria-hidden />
            รายการ
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <TasksCalendar tasks={filtered} onSelectTask={setDetail} />
      ) : (
        <TasksTable tasks={filtered} onSelectTask={setDetail} />
      )}

      <TaskDetailDialog
        task={detail}
        onClose={() => setDetail(null)}
        onEdit={(t) => {
          setDetail(null);
          setEditing(t);
        }}
        onDelete={handleDelete}
      />
      <EditTaskDialog task={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
