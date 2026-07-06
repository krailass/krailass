import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { PublicOverview } from '@/components/public/PublicOverview';

export const dynamic = 'force-dynamic';

// Root is the public, login-free overview. Signed-in staff fall through to the
// app so their landing behaviour is unchanged.
export default async function RootPage() {
  const sb = await getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (user) redirect('/dashboard');
  return <PublicOverview />;
}
