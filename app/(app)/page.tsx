import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/auth';

export default async function Home() {
  await getSessionProfile();
  redirect('/dashboard');
}
