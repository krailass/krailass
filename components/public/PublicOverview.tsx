'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { MapPin, CalendarDays, X, LogIn, ImageOff, Loader2, LayoutGrid, List } from 'lucide-react';
import { StatusPill, CategoryBadge, UrgentBadge } from '@/components/ui/badges';
import { fmtThaiDate, fmtThaiDateFull, hhmm, categoryColor } from '@/lib/utils';
import type { PublicTask, PublicPhoto } from '@/lib/public-types';

type Filter = 'month' | 'all' | 'done' | 'undone';
type View = 'grid' | 'list';

// Urgent tasks get a red accent regardless of category.
const URGENT_COLOR = '#B91C1C';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'month', label: 'เดือนนี้' },
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'done', label: 'เสร็จแล้ว' },
  { key: 'undone', label: 'ยังไม่เสร็จ' },
];

const taskDate = (t: PublicTask) => t.assigned_date || t.due_date;

function inCurrentMonth(t: PublicTask): boolean {
  const d = taskDate(t);
  if (!d) return false;
  const dt = new Date(d);
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
}

export function PublicOverview() {
  const [tasks, setTasks] = React.useState<PublicTask[] | null>(null);
  const [error, setError] = React.useState(false);
  const [filter, setFilter] = React.useState<Filter>('month');
  const [view, setView] = React.useState<View>('grid');
  const [selected, setSelected] = React.useState<PublicTask | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch('/api/public/overview')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load'))))
      .then((j) => alive && setTasks(j.tasks ?? []))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const visible = React.useMemo(() => {
    const all = tasks ?? [];
    if (filter === 'all') return all;
    if (filter === 'done') return all.filter((t) => t.status === 'done');
    if (filter === 'undone') return all.filter((t) => t.status !== 'done');
    return all.filter(inCurrentMonth);
  }, [tasks, filter]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-gradient-to-br from-brand to-[#0E3B36] text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3.5 px-4 py-5 sm:py-7">
          <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-lg sm:h-16 sm:w-16">
            <Image
              src="/logo.png"
              alt="ตราโรงเรียนสวายวิทยาคาร"
              width={64}
              height={64}
              className="h-full w-full object-contain p-1"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-bold leading-tight sm:text-[24px]">ภาพรวมงานนักการภารโรง</h1>
            <p className="text-[13px] font-medium text-white/80 sm:text-[15px]">โรงเรียนสวายวิทยาคาร</p>
          </div>
          <Link
            href="/login"
            className="flex flex-none items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[12.5px] font-semibold backdrop-blur transition-colors hover:bg-white/25"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">เข้าสู่ระบบ</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-card p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                  filter === f.key ? 'bg-brand text-white' : 'text-[#5A6772] hover:bg-canvas'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {tasks && <span className="text-[12.5px] text-muted-soft">{visible.length} งาน</span>}

          <div className="ml-auto inline-flex rounded-[11px] border border-line bg-card p-1">
            <button
              onClick={() => setView('grid')}
              aria-label="มุมมองการ์ด"
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${
                view === 'grid' ? 'bg-brand text-white' : 'text-[#5A6772] hover:bg-canvas'
              }`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="มุมมองลิสต์"
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${
                view === 'list' ? 'bg-brand text-white' : 'text-[#5A6772] hover:bg-canvas'
              }`}
            >
              <List className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {error ? (
          <EmptyBox text="โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" />
        ) : !tasks ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-brand" aria-hidden />
          </div>
        ) : visible.length === 0 ? (
          <EmptyBox text="ยังไม่มีงานในช่วงที่เลือก" />
        ) : view === 'list' ? (
          <div className="flex flex-col gap-2">
            {visible.map((t) => (
              <TaskRow key={t.id} t={t} onClick={() => setSelected(t)} />
            ))}
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((t) => (
              <TaskCard key={t.id} t={t} onClick={() => setSelected(t)} />
            ))}
          </div>
        )}
      </main>

      <PublicDetail task={selected} onClose={() => setSelected(null)} />

      <footer className="mx-auto max-w-5xl px-4 pb-8 pt-4 text-center text-[11.5px] text-muted-faint">
        ระบบจัดการงานนักการภารโรง · อาคารสถานที่ โรงเรียนสวายวิทยาคาร
      </footer>
    </div>
  );
}

function TaskCard({ t, onClick }: { t: PublicTask; onClick: () => void }) {
  const dateText = t.due_text || fmtThaiDate(taskDate(t)) || '—';
  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded-card border border-line bg-card p-4 text-left shadow-soft transition-shadow hover:shadow-pop"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CategoryBadge category={t.category} />
        {t.priority === 'urgent' && <UrgentBadge />}
        <span className="ml-auto">
          <StatusPill status={t.status} />
        </span>
      </div>
      <div className="text-[14px] font-semibold leading-snug text-ink">{t.title}</div>
      <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-soft">
        <MapPin className="h-3.5 w-3.5 flex-none" aria-hidden />
        <span className="truncate">{t.location || '—'}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-muted-faint">
        <span className="truncate">ผู้รับผิดชอบ {t.assigneeName}</span>
        <span className="ml-auto flex flex-none items-center gap-1">
          <CalendarDays className="h-3 w-3" aria-hidden />
          {dateText}
        </span>
      </div>
    </button>
  );
}

function TaskRow({ t, onClick }: { t: PublicTask; onClick: () => void }) {
  const dateText = t.due_text || fmtThaiDate(taskDate(t)) || '—';
  const bar = t.priority === 'urgent' ? URGENT_COLOR : categoryColor(t.category).text;
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 text-left shadow-soft transition-shadow hover:shadow-pop"
    >
      <span className="h-9 w-1.5 flex-none rounded-full" style={{ background: bar }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13.5px] font-semibold text-ink">{t.title}</span>
          {t.priority === 'urgent' && <UrgentBadge />}
          <CategoryBadge category={t.category} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-muted-soft">
          <span className="truncate">ผู้รับผิดชอบ {t.assigneeName}</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-none" aria-hidden />
            {t.location || '—'}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3 flex-none" aria-hidden />
            {dateText}
          </span>
        </div>
      </div>
      <span className="flex-none">
        <StatusPill status={t.status} />
      </span>
    </button>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-card py-16 text-center text-[13px] text-muted-faint">
      {text}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-1.5 text-[13px]">
      <div className="w-24 flex-none text-muted-soft">{label}</div>
      <div className="min-w-0 flex-1 font-medium text-ink">{value || '—'}</div>
    </div>
  );
}

function PhotoCol({ title, photos }: { title: string; photos: PublicPhoto[] }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-bold text-muted-soft">{title}ดำเนินการ</div>
      {photos.length === 0 ? (
        <div className="flex h-20 items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-[#F8FAF7] text-[11px] text-muted-faint">
          <ImageOff className="h-4 w-4" aria-hidden />
          ไม่มีภาพ
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.url}
              alt=""
              className="aspect-square w-full rounded-lg border border-line object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PublicDetail({ task, onClose }: { task: PublicTask | null; onClose: () => void }) {
  const [photos, setPhotos] = React.useState<PublicPhoto[] | null>(null);

  React.useEffect(() => {
    if (!task) return;
    let alive = true;
    setPhotos(null);
    fetch(`/api/public/photos?task=${task.id}`)
      .then((r) => r.json())
      .then((j) => alive && setPhotos(j.photos ?? []))
      .catch(() => alive && setPhotos([]));
    return () => {
      alive = false;
    };
  }, [task]);

  const before = (photos ?? []).filter((p) => p.kind === 'before');
  const after = (photos ?? []).filter((p) => p.kind === 'after');

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
                    {task.priority === 'urgent' && <UrgentBadge />}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <CategoryBadge category={task.category} />
                    <StatusPill status={task.status} />
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
                  <Row label="สถานที่" value={task.location || task.place || '—'} />
                  <Row label="ประเภทงาน" value={task.category || '—'} />
                  <Row label="กำหนด" value={task.due_text || fmtThaiDate(task.due_date) || '—'} />
                  <Row
                    label="วันที่มอบหมาย"
                    value={task.assigned_date ? fmtThaiDateFull(task.assigned_date) : '—'}
                  />
                  {(task.time_start || task.time_end) && (
                    <Row
                      label="เวลาปฏิบัติงาน"
                      value={`${hhmm(task.time_start) || '—'}–${hhmm(task.time_end) || '—'}`}
                    />
                  )}
                  <Row label="วัสดุอุปกรณ์" value={task.materials || '—'} />
                  {task.note && <Row label="รายละเอียด/ผล" value={task.note} />}
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-[12.5px] font-semibold text-[#4A574F]">
                    ภาพก่อน–หลังดำเนินการ
                  </div>
                  {photos === null ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <PhotoCol title="ก่อน" photos={before} />
                      <PhotoCol title="หลัง" photos={after} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
