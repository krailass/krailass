'use client';

import * as React from 'react';
import { Spinner } from './primitives';

export function Loading({ label = 'กำลังโหลด…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
  return (
    <div className="rounded-card border border-[#F0D9D6] bg-urgent-bg p-4 text-sm text-urgent">
      โหลดข้อมูลไม่สำเร็จ: {msg}
    </div>
  );
}

interface FilterTabsProps<T extends string> {
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}

export function FilterTabs<T extends string>({ value, options, onChange }: FilterTabsProps<T>) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" data-noprint>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
              active
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-card text-[#5A6772] hover:bg-canvas'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
