import { getSessionProfile } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, profile } = await getSessionProfile();
  return (
    <AppShell userId={userId} profile={profile}>
      {children}
    </AppShell>
  );
}
