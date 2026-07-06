'use client';

import { Paperclip } from 'lucide-react';
import { useTaskPhotos } from '@/hooks/useAppData';

// Reference images an admin attached when creating the task. Read-only; shown to
// janitors (on the report form) and in the task detail dialog.
export function AttachmentPhotos({
  taskId,
  title = 'รูปแนบจากผู้มอบหมาย',
}: {
  taskId: string;
  title?: string;
}) {
  const { data: photos = [] } = useTaskPhotos(taskId);
  const atts = photos.filter((p) => p.kind === 'attachment');
  if (atts.length === 0) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#4A574F]">
        <Paperclip className="h-3.5 w-3.5" aria-hidden />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {atts.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="flex-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              className="h-20 w-20 rounded-lg border border-line object-cover transition-opacity hover:opacity-90"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
