'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navFor } from './nav';
import { useProfile } from './ProfileContext';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

export function SideNav() {
  const { profile } = useProfile();
  const pathname = usePathname();
  const items = navFor(profile.role);

  return (
    <nav
      data-noprint
      className="hidden w-[236px] flex-none flex-col gap-1 bg-brand-sidebar p-[18px_14px] md:flex"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-[11px] px-3.5 py-3 text-[14.5px] font-medium transition-colors',
              active ? 'bg-accent text-[#06261F]' : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="h-[19px] w-[19px] flex-none" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
