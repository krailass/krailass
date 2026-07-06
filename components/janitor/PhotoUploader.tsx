'use client';

import * as React from 'react';
import { ImagePlus, X } from 'lucide-react';

export function PhotoUploader({
  label,
  files,
  onChange,
  max,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  /** Cap the number of images. When omitted, unlimited. */
  max?: number;
}) {
  const [urls, setUrls] = React.useState<string[]>([]);

  React.useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const atMax = max != null && files.length >= max;

  function add(list: FileList | null) {
    if (!list || list.length === 0) return;
    const merged = [...files, ...Array.from(list)];
    onChange(max != null ? merged.slice(0, max) : merged);
  }

  function remove(idx: number) {
    onChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="mb-2 block text-[12.5px] font-semibold text-[#4A574F]">
        {label}{' '}
        <span className="font-medium text-muted-faint">
          {max != null ? `(สูงสุด ${max} รูป)` : '(เพิ่มได้หลายรูป)'}
        </span>
      </label>
      <div className="flex flex-wrap gap-2.5">
        {urls.map((u, i) => (
          <div key={i} className="relative h-24 w-24 flex-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-24 w-24 rounded-xl border border-line object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="ลบรูป"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-urgent text-white shadow"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ))}
        {!atMax && (
          <label className="flex h-24 w-24 flex-none cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#CBD5CC] bg-[#F8FAF7] text-muted-soft hover:bg-canvas">
            <ImagePlus className="h-5 w-5" aria-hidden />
            <span className="text-[11px] font-semibold">เพิ่มรูป</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                add(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
