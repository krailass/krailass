'use client';

import { List, Clock, Wrench, CheckCircle2, type LucideIcon } from 'lucide-react';
import { useTasks } from '@/hooks/useAppData';
import { Card, Avatar, EmptyState } from '@/components/ui/primitives';
import { CategoryBadge, StatusPill } from '@/components/ui/badges';
import { Loading, ErrorBox } from '@/components/ui/states';
import { pct } from '@/lib/utils';

interface Kpi {
  label: string;
  value: number;
  sub: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export function Overview() {
  const { data: tasks, isLoading, error } = useTasks();
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const all = tasks ?? [];
  const count = (s: string) => all.filter((t) => t.status === s).length;
  const total = all.length;
  const pending = count('pending');
  const progress = count('progress');
  const done = count('done');
  const approved = all.filter((t) => t.approval === 'approved').length;
  const waiting = all.filter((t) => t.status === 'done' && t.approval === 'waiting').length;

  const kpis: Kpi[] = [
    { label: 'งานทั้งหมด', value: total, sub: 'รายการในระบบ', icon: List, color: '#0F766E', bg: '#E4F1EF' },
    { label: 'ยังไม่ดำเนินงาน', value: pending, sub: 'รอเริ่มงาน', icon: Clock, color: '#5A6772', bg: '#EEF1F4' },
    { label: 'กำลังดำเนินงาน', value: progress, sub: 'อยู่ระหว่างทำ', icon: Wrench, color: '#B45309', bg: '#FDF1E1' },
    { label: 'ดำเนินการแล้ว', value: done, sub: `${approved} อนุมัติแล้ว`, icon: CheckCircle2, color: '#0F7A45', bg: '#E4F4EC' },
  ];

  const bars = [
    { w: pct(pending, total), c: '#94A3B8', label: 'ยังไม่ดำเนินงาน', n: pending },
    { w: pct(progress, total), c: '#F59E0B', label: 'กำลังดำเนินงาน', n: progress },
    { w: pct(done, total), c: '#22C55E', label: 'ดำเนินการแล้ว', n: done },
  ];

  const recent = all.slice(0, 6);

  return (
    <div className="animate-fadeUp">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-[18px] shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-muted">{k.label}</div>
                <span
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px]"
                  style={{ background: k.bg, color: k.color }}
                >
                  <Icon className="h-[22px] w-[22px]" aria-hidden />
                </span>
              </div>
              <div className="mt-2 text-[34px] font-bold leading-none" style={{ color: k.color }}>
                {k.value}
              </div>
              <div className="mt-1.5 text-[12px] text-muted-faint">{k.sub}</div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 text-[15px] font-bold">สัดส่วนสถานะงานทั้งหมด</div>
          <div className="flex h-5 overflow-hidden rounded-lg bg-[#F1F4EF]">
            {bars.map((b, i) => (
              <div key={i} style={{ width: `${b.w}%`, background: b.c }} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {bars.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-[11px] w-[11px] rounded" style={{ background: b.c }} />
                <span className="text-[13px] font-medium text-[#4A574F]">{b.label}</span>
                <span className="text-[13px] font-bold">{b.n}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="rounded-card bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-[0_12px_30px_-16px_rgba(15,118,110,.6)]">
          <div className="text-[13px] font-semibold opacity-85">รอการตรวจและอนุมัติ</div>
          <div className="mt-1.5 font-looped text-[44px] font-bold leading-none">{waiting}</div>
          <div className="mt-2 text-[12.5px] leading-relaxed opacity-80">
            งานที่นักการรายงานเสร็จแล้ว รอหัวหน้าอาคารสถานที่ตรวจสอบและอนุมัติในระบบ
          </div>
        </div>
      </div>

      <Card className="mt-4 p-5">
        <div className="mb-3.5 text-[15px] font-bold">งานล่าสุด</div>
        {recent.length === 0 ? (
          <EmptyState title="ยังไม่มีงานในระบบ" />
        ) : (
          <div className="flex flex-col gap-2.5">
            {recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-[#EEF1EC] px-3 py-2.5"
              >
                <Avatar name={t.assigneeName} initial={t.assigneeInitial} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold">{t.title}</div>
                  <div className="text-[11.5px] text-muted-soft">
                    {t.assigneeName} · {t.location || '—'}
                  </div>
                </div>
                <div className="hidden flex-none sm:block">
                  <CategoryBadge category={t.category} />
                </div>
                <StatusPill status={t.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
