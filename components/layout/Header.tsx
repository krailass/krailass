'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { SCHOOL } from '@/lib/constants';
import { initial } from '@/lib/utils';
import { ROLE_META } from './nav';
import { useProfile } from './ProfileContext';
import { NotificationBell } from './NotificationBell';
import { InstallButton } from './InstallButton';

export function Header() {
  const { profile } = useProfile();
  const router = useRouter();
  const meta = ROLE_META[profile.role];

  async function logout() {
    await getSupabaseBrowser().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <header
      data-noprint
      className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b border-line bg-card px-4 py-3 md:px-[22px]"
    >
      <div className="flex flex-none items-center gap-3">
        <div className="flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-[12px] border border-line bg-white shadow-[0_4px_12px_-4px_rgba(15,118,110,.3)]">
          <Image
            src="/logo.png"
            alt="ตราโรงเรียนสวายวิทยาคาร"
            width={42}
            height={42}
            className="h-full w-full object-contain p-0.5"
            priority
          />
        </div>
        <div>
          <div className="text-[15.5px] font-bold leading-tight">{SCHOOL.name}</div>
          <div className="hidden text-[11.5px] font-medium text-muted sm:block">{SCHOOL.system}</div>
        </div>
      </div>

      <div className="ml-auto flex flex-none items-center gap-2 md:gap-3">
        <InstallButton />
        <NotificationBell />
        <div className="flex items-center gap-2.5">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#DCEBE8] text-[15px] font-bold text-brand">
            {initial(profile.full_name)}
          </span>
          <div className="hidden leading-tight sm:block">
            <div className="text-[13px] font-semibold">{profile.full_name || meta.label}</div>
            <div className="text-[11px] text-muted-soft">{profile.role === 'admin' ? meta.sub : profile.zone || meta.label}</div>
          </div>
        </div>
        <button
          onClick={logout}
          aria-label="ออกจากระบบ"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-line bg-card text-[#5A6772] hover:bg-canvas"
        >
          <LogOut className="h-[17px] w-[17px]" aria-hidden />
        </button>
      </div>
    </header>
  );
}
