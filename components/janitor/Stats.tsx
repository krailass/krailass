'use client';

import { useTasks, useCategories } from '@/hooks/useAppData';
import { useProfile } from '@/components/layout/ProfileContext';
import { Card } from '@/components/ui/primitives';
import { Loading } from '@/components/ui/states';
import { categoryColor, pct } from '@/lib/utils';

// Read-only personal stats for a janitor. The per-person PDF export lives on the
// admin side (/admin/reports → PersonSummaryReport), where an admin picks whose
// summary to export.
export function Stats() {
  const { userId } = useProfile();
  const { data: tasks, isLoading } = useTasks();
  const { data: categories = [] } = useCategories();

  if (isLoading) return <Loading />;

  const mine = (tasks ?? []).filter((t) => t.assignee_id === userId);
  const done = mine.filter((t) => t.status === 'done').length;
  const progress = mine.filter((t) => t.status === 'progress').length;
  const total = mine.length;

  const catMax = Math.max(
    1,
    ...categories.map((c) => mine.filter((t) => t.category === c.name).length),
  );
  const catData = categories
    .map((c) => ({ name: c.name, n: mine.filter((t) => t.category === c.name).length }))
    .filter((c) => c.n > 0);

  const tiles = [
    { label: 'งานที่รับผิดชอบ', value: total, color: '#0F766E' },
    { label: 'ดำเนินการแล้ว', value: done, color: '#0F7A45' },
    { label: 'กำลังทำ', value: progress, color: '#B45309' },
    { label: 'อัตราสำเร็จ', value: `${pct(done, total)}%`, color: '#0F766E' },
  ];

  return (
    <div className="animate-fadeUp">
      <div className="mb-4 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <div className="text-[13px] font-semibold text-muted">{t.label}</div>
            <div className="mt-1.5 text-3xl font-bold" style={{ color: t.color }}>
              {t.value}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 text-[15px] font-bold">งานแยกตามประเภท</div>
        {catData.length === 0 ? (
          <div className="py-4 text-sm text-muted-faint">ยังไม่มีข้อมูล</div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {catData.map((c) => {
              const cc = categoryColor(c.name);
              return (
                <div key={c.name} className="flex items-center gap-3.5">
                  <div className="w-28 flex-none text-[13px] font-semibold text-[#4A574F]">{c.name}</div>
                  <div className="h-6 flex-1 overflow-hidden rounded-lg bg-[#F1F4EF]">
                    <div
                      className="flex h-full items-center justify-end rounded-lg pr-2.5 text-[12px] font-bold text-white"
                      style={{ width: `${Math.round((c.n / catMax) * 100)}%`, minWidth: 26, background: cc.text }}
                    >
                      {c.n}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
