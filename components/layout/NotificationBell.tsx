'use client';

import * as React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { markAllNotificationsRead, markNotificationRead } from '@/lib/api';
import { useNotifications, qk } from '@/hooks/useAppData';
import { useProfile } from './ProfileContext';
import { fmtThaiDate } from '@/lib/utils';

export function NotificationBell() {
  const { userId } = useProfile();
  const { data: items = [] } = useNotifications(userId);
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const unread = items.filter((n) => !n.is_read).length;

  const refresh = () => qc.invalidateQueries({ queryKey: qk.notifications(userId) });

  async function onOpen() {
    setOpen((v) => !v);
  }

  async function readOne(id: string) {
    try {
      await markNotificationRead(getSupabaseBrowser(), id);
      refresh();
    } catch {
      toast.error('อัปเดตการแจ้งเตือนไม่สำเร็จ');
    }
  }

  async function readAll() {
    try {
      await markAllNotificationsRead(getSupabaseBrowser(), userId);
      refresh();
    } catch {
      toast.error('อัปเดตการแจ้งเตือนไม่สำเร็จ');
    }
  }

  return (
    <div className="relative" data-noprint>
      <button
        onClick={onOpen}
        aria-label="การแจ้งเตือน"
        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-line bg-card text-[#5A6772] hover:bg-canvas"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-[9px] w-[9px] rounded-full border-2 border-white bg-urgent" />
        )}
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-3 top-[60px] z-50 w-[calc(100vw-24px)] max-w-[360px] overflow-hidden rounded-[14px] border border-line bg-card shadow-pop sm:absolute sm:right-0 sm:top-[46px] sm:w-[340px] sm:max-w-none">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="text-sm font-bold">การแจ้งเตือน</div>
              {unread > 0 && (
                <button
                  onClick={readAll}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> อ่านทั้งหมด
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 && (
                <div className="px-4 py-8 text-center text-[13px] text-muted-faint">
                  ยังไม่มีการแจ้งเตือน
                </div>
              )}
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => readOne(n.id)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-line px-4 py-3 text-left last:border-b-0 ${
                    n.is_read ? 'bg-card' : 'bg-[#F1F7F5]'
                  }`}
                >
                  <div className="flex w-full items-center gap-2">
                    {!n.is_read && <span className="h-2 w-2 flex-none rounded-full bg-brand" />}
                    <span className="text-[13px] font-semibold text-ink">{n.title}</span>
                  </div>
                  {n.body && <span className="text-[12px] text-muted">{n.body}</span>}
                  <span className="text-[11px] text-muted-faint">{fmtThaiDate(n.created_at)}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
