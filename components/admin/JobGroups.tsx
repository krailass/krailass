'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { useTasks } from '@/hooks/useAppData';
import type { DecoratedTask } from '@/lib/task-view';
import { Card } from '@/components/ui/primitives';
import { CategoryBadge, StatusPill, ApprovalBadge } from '@/components/ui/badges';
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog';

interface Group {
  key: string;
  title: string;
  category: string | null;
  tasks: DecoratedTask[];
}

// A task counts as "submitted" once the janitor has reported it (status done).
const isSubmitted = (t: DecoratedTask) => t.status === 'done';

// Shows jobs that were split across several janitors (งานใครงานมัน): the parent
// job, who it went to, and who has submitted vs not.
export function JobGroups() {
  const { data: tasks = [] } = useTasks();
  const [detail, setDetail] = React.useState<DecoratedTask | null>(null);

  const groups = React.useMemo(() => {
    const m = new Map<string, Group>();
    for (const t of tasks) {
      if (!t.job_group) continue;
      const g = m.get(t.job_group);
      if (g) g.tasks.push(t);
      else m.set(t.job_group, { key: t.job_group, title: t.title, category: t.category, tasks: [t] });
    }
    return [...m.values()].filter((g) => g.tasks.length > 1);
  }, [tasks]);

  if (groups.length === 0) return null;

  return (
    <div className="mb-5 animate-fadeUp">
      <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#4A574F]">
        <Users className="h-4 w-4" aria-hidden />
        งานที่แตกให้หลายคน ({groups.length})
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {groups.map((g) => {
          const done = g.tasks.filter(isSubmitted).length;
          return (
            <Card key={g.key} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[14px] font-semibold">{g.title}</div>
                <CategoryBadge category={g.category} />
                <span
                  className={`ml-auto rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${
                    done === g.tasks.length
                      ? 'bg-[#E4F4EC] text-status-done'
                      : 'bg-canvas text-[#5A6772]'
                  }`}
                >
                  ส่งแล้ว {done}/{g.tasks.length}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {g.tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetail(t)}
                    className="flex items-center gap-2 rounded-lg border border-[#EEF1EC] px-2.5 py-2 text-left hover:bg-canvas"
                  >
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                      {t.assigneeName}
                    </span>
                    {t.approvalLabel && (
                      <ApprovalBadge label={t.approvalLabel} color={t.approvalColor!} bg={t.approvalBg!} />
                    )}
                    {isSubmitted(t) ? (
                      <StatusPill status={t.status} />
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-[#EEF1F4] px-2.5 py-1 text-[11.5px] font-semibold text-[#5A6772]">
                        ยังไม่ส่ง
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      <TaskDetailDialog task={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
