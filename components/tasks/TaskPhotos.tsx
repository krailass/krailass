'use client';

import { ImageOff } from 'lucide-react';
import { useTaskPhotos } from '@/hooks/useAppData';
import type { TaskPhoto } from '@/lib/api';

function Grid({ photos, empty }: { photos: TaskPhoto[]; empty: string }) {
  if (photos.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-[#F8FAF7] text-[11.5px] text-muted-faint">
        <ImageOff className="h-4 w-4" aria-hidden />
        {empty}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {photos.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id}
          src={p.url}
          alt=""
          className="h-16 w-16 rounded-lg border border-line object-cover"
        />
      ))}
    </div>
  );
}

export function TaskPhotos({ taskId }: { taskId: string }) {
  const { data: photos = [] } = useTaskPhotos(taskId);
  const before = photos.filter((p) => p.kind === 'before');
  const after = photos.filter((p) => p.kind === 'after');
  return (
    <div className="w-full sm:w-60">
      <div className="mb-1.5 text-[11px] font-bold text-muted-soft">ก่อนดำเนินการ</div>
      <Grid photos={before} empty="ยังไม่มีภาพก่อน" />
      <div className="mb-1.5 mt-2.5 text-[11px] font-bold text-muted-soft">หลังดำเนินการ</div>
      <Grid photos={after} empty="ยังไม่มีภาพหลัง" />
    </div>
  );
}
