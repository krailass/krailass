'use client';

import * as React from 'react';
import { BellRing, X } from 'lucide-react';
import { toast } from 'sonner';
import { enablePush, pushSupported } from '@/lib/push-client';
import { useProfile } from './ProfileContext';

const DISMISS_KEY = 'sawai-push-dismissed';

export function PushPrompt() {
  const { userId } = useProfile();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!pushSupported()) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  async function enable() {
    const res = await enablePush(userId);
    setShow(false);
    if (res === 'ok') toast.success('เปิดการแจ้งเตือนแล้ว');
    else if (res === 'denied') toast.error('ไม่ได้รับอนุญาตให้แจ้งเตือน');
    else if (res === 'error') toast.error('เปิดการแจ้งเตือนไม่สำเร็จ (ยังไม่ได้ตั้งค่า VAPID)');
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  }

  return (
    <div
      data-noprint
      className="fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-[14px] border border-line bg-card p-3.5 shadow-pop md:bottom-6 md:left-auto md:right-6"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#DCEBE8] text-brand">
        <BellRing className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold">รับการแจ้งเตือนงาน</div>
        <div className="text-[12px] text-muted">เปิดแจ้งเตือนเมื่อมีงานใหม่หรือผลการตรวจ</div>
      </div>
      <button
        onClick={enable}
        className="flex-none rounded-[10px] bg-brand px-3 py-2 text-[12.5px] font-semibold text-white"
      >
        เปิด
      </button>
      <button onClick={dismiss} aria-label="ปิด" className="flex-none text-muted-faint">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
