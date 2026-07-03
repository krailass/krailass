'use client';

import * as React from 'react';
import type { ProfileRow } from '@/lib/database.types';
import { ProfileProvider } from './ProfileContext';
import { Header } from './Header';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { RealtimeSync } from './RealtimeSync';
import { PushPrompt } from './PushPrompt';
import { UrgentAlert } from './UrgentAlert';

export function AppShell({
  userId,
  profile,
  children,
}: {
  userId: string;
  profile: ProfileRow;
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider value={{ userId, profile }}>
      <RealtimeSync />
      <div className="flex min-h-screen flex-col bg-canvas text-ink">
        <Header />
        <div className="flex flex-1">
          <SideNav />
          <main className="min-w-0 flex-1 overflow-x-hidden px-3.5 pb-24 pt-5 sm:px-6 sm:pb-14 md:px-7 md:pb-14">
            <div className="mx-auto max-w-[1180px]">{children}</div>
          </main>
        </div>
        <BottomNav />
      </div>
      <PushPrompt />
      <UrgentAlert />
    </ProfileProvider>
  );
}

export function PageHeader({ sub, title }: { sub: string; title: string }) {
  return (
    <div className="mb-5" data-noprint>
      <div className="text-[12px] font-semibold tracking-wide text-muted-soft">{sub}</div>
      <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{title}</h1>
    </div>
  );
}
