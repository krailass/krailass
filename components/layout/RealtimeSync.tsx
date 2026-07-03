'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { qk } from '@/hooks/useAppData';
import { useProfile } from './ProfileContext';

/** Subscribes to Postgres changes and keeps react-query caches fresh. */
export function RealtimeSync() {
  const qc = useQueryClient();
  const { userId } = useProfile();

  React.useEffect(() => {
    const sb = getSupabaseBrowser();
    const channel = sb
      .channel('app-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        qc.invalidateQueries({ queryKey: qk.tasks });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_photos' }, () => {
        qc.invalidateQueries({ queryKey: ['photos'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        qc.invalidateQueries({ queryKey: qk.janitors });
        qc.invalidateQueries({ queryKey: qk.profiles });
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => {
          qc.invalidateQueries({ queryKey: qk.notifications(userId) });
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [qc, userId]);

  return null;
}
