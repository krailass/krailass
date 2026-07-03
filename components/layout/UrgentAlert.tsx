'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { markNotificationRead } from '@/lib/api';
import { useNotifications, qk } from '@/hooks/useAppData';
import { useProfile } from './ProfileContext';
import { Button } from '@/components/ui/primitives';

/**
 * Prominent popup for new URGENT task assignments. Shows on login (unread
 * urgent notifications) and in realtime when one arrives. Push messages are
 * delivered separately via /api/notify.
 */
export function UrgentAlert() {
  const { userId } = useProfile();
  const { data: items = [] } = useNotifications(userId);
  const router = useRouter();
  const qc = useQueryClient();
  const [acked, setAcked] = React.useState<Set<string>>(new Set());

  const urgent = items.filter((n) => n.type === 'urgent' && !n.is_read && !acked.has(n.id));
  const open = urgent.length > 0;

  async function acknowledge() {
    const ids = urgent.map((n) => n.id);
    if (ids.length === 0) return;
    setAcked((prev) => new Set([...prev, ...ids]));
    const sb = getSupabaseBrowser();
    await Promise.all(ids.map((id) => markNotificationRead(sb, id).catch(() => {})));
    qc.invalidateQueries({ queryKey: qk.notifications(userId) });
  }

  async function goBoard() {
    await acknowledge();
    router.push('/janitor/board');
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && acknowledge()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] border border-[#F0D9D6] bg-card shadow-pop focus:outline-none">
          <div className="flex items-center gap-3 bg-urgent-bg px-5 py-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-urgent text-white">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <Dialog.Title className="text-[16px] font-bold text-urgent">งานเร่งด่วน!</Dialog.Title>
              <Dialog.Description className="text-[12.5px] text-[#8a3a33]">
                คุณได้รับมอบหมายงานเร่งด่วน {urgent.length} งาน กรุณาดำเนินการโดยเร็ว
              </Dialog.Description>
            </div>
          </div>

          <div className="max-h-[45vh] overflow-y-auto p-5">
            <div className="flex flex-col gap-2">
              {urgent.map((n) => (
                <div key={n.id} className="rounded-xl border border-[#F0D9D6] bg-[#FDF7F6] px-3.5 py-2.5">
                  <div className="text-[13.5px] font-semibold text-ink">{n.body || n.title}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" block onClick={acknowledge}>
                รับทราบ
              </Button>
              <Button variant="danger" block onClick={goBoard}>
                ไปที่งานของฉัน
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
