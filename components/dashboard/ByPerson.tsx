'use client';

import { useTasks, useJanitors } from '@/hooks/useAppData';
import { Card, Avatar, EmptyState } from '@/components/ui/primitives';
import { Loading } from '@/components/ui/states';
import { pct } from '@/lib/utils';

export function ByPerson() {
  const { data: tasks, isLoading } = useTasks();
  const { data: janitors = [] } = useJanitors();
  if (isLoading) return <Loading />;

  const all = tasks ?? [];
  if (janitors.length === 0) {
    return <EmptyState title="ยังไม่มีนักการภารโรงในระบบ" hint="เพิ่มรายชื่อได้ที่เมนูจัดการนักการ" />;
  }

  return (
    <div className="grid animate-fadeUp gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {janitors.map((j) => {
        const mine = all.filter((t) => t.assignee_id === j.id);
        const done = mine.filter((t) => t.status === 'done').length;
        const progress = mine.filter((t) => t.status === 'progress').length;
        const pending = mine.filter((t) => t.status === 'pending').length;
        const rate = pct(done, mine.length);
        return (
          <Card key={j.id} className="p-[18px]">
            <div className="flex items-center gap-3">
              <Avatar name={j.full_name} initial={j.full_name.replace(/^(นางสาว|นาย|นาง)/, '').charAt(0) || '•'} size={46} />
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-bold">{j.full_name}</div>
                <div className="text-[11.5px] text-muted-soft">{j.zone || '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-bold leading-none text-brand">{rate}%</div>
                <div className="text-[10.5px] text-muted-faint">สำเร็จ</div>
              </div>
            </div>
            <div className="mt-3.5 h-2 overflow-hidden rounded-md bg-[#F1F4EF]">
              <div
                className="h-full rounded-md bg-gradient-to-r from-accent to-brand"
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="mt-3.5 flex gap-2">
              <Stat n={pending} label="รอ" bg="#EEF1F4" color="#5A6772" />
              <Stat n={progress} label="ทำ" bg="#FDF1E1" color="#B45309" />
              <Stat n={done} label="เสร็จ" bg="#E4F4EC" color="#0F7A45" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ n, label, bg, color }: { n: number; label: string; bg: string; color: string }) {
  return (
    <div className="flex-1 rounded-[10px] py-2.5 text-center" style={{ background: bg }}>
      <div className="text-[17px] font-bold" style={{ color }}>
        {n}
      </div>
      <div className="text-[10.5px] text-muted-soft">{label}</div>
    </div>
  );
}
