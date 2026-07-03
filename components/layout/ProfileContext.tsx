'use client';

import * as React from 'react';
import type { ProfileRow } from '@/lib/database.types';

interface ProfileCtx {
  userId: string;
  profile: ProfileRow;
}

const Ctx = React.createContext<ProfileCtx | null>(null);

export function ProfileProvider({
  value,
  children,
}: {
  value: ProfileCtx;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile(): ProfileCtx {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useProfile must be used within ProfileProvider');
  return v;
}
