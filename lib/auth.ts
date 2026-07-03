import { redirect } from 'next/navigation';
import { getSupabaseServer } from './supabase/server';
import type { ProfileRow } from './database.types';

export interface SessionProfile {
  userId: string;
  profile: ProfileRow;
}

/** Load the authenticated user's profile in a Server Component. Redirects if absent/inactive. */
export async function getSessionProfile(): Promise<SessionProfile> {
  const sb = await getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active) {
    redirect('/login?error=inactive');
  }

  return { userId: user.id, profile: profile as ProfileRow };
}

export async function requireAdmin(): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (session.profile.role !== 'admin') redirect('/dashboard');
  return session;
}
