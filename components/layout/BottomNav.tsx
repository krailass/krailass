'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { bottomBarFor, type NavItem } from './nav';
import { useProfile } from './ProfileContext';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

function SlotLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10.5px] font-medium transition-colors',
        active ? 'text-accent' : 'text-white/65',
      )}
    >
      <Icon className="h-[19px] w-[19px]" aria-hidden />
      <span className="max-w-[70px] truncate">{item.label}</span>
    </Link>
  );
}

export function BottomNav() {
  const { profile } = useProfile();
  const pathname = usePathname();
  const bar = bottomBarFor(profile.role);
  const [moreOpen, setMoreOpen] = React.useState(false);

  React.useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const fabActive = isActive(pathname, bar.fab.href);
  const FabIcon = bar.fab.icon;
  const Slot5Icon = bar.slot5.icon;
  const slot5Active = bar.slot5.kind === 'link' ? isActive(pathname, bar.slot5.href) : moreOpen;

  return (
    <>
      <nav
        data-noprint
        aria-label="เมนูหลัก"
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-white/10 bg-brand-sidebar md:hidden"
      >
        <SlotLink item={bar.left[0]} pathname={pathname} />
        <SlotLink item={bar.left[1]} pathname={pathname} />

        {/* Slot 3 — raised center FAB */}
        <div className="relative flex w-[68px] flex-none flex-col items-center justify-end pb-1.5">
          <Link
            href={bar.fab.href}
            aria-label={bar.fab.label}
            className={cn(
              'absolute -top-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white ring-4 ring-canvas transition-transform active:scale-95',
              fabActive ? 'bg-brand-dark' : 'bg-brand',
            )}
            style={{ boxShadow: '0 8px 20px -6px rgba(15,118,110,.85)' }}
          >
            <FabIcon className="h-7 w-7" strokeWidth={2.4} aria-hidden />
          </Link>
          <span className="text-[10.5px] font-medium text-white/65">{bar.fab.label}</span>
        </div>

        <SlotLink item={bar.right} pathname={pathname} />

        {/* Slot 5 — More sheet (admin) or direct link (janitor → profile) */}
        {bar.slot5.kind === 'link' ? (
          <Link
            href={bar.slot5.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10.5px] font-medium transition-colors',
              slot5Active ? 'text-accent' : 'text-white/65',
            )}
          >
            <Slot5Icon className="h-[19px] w-[19px]" aria-hidden />
            <span>{bar.slot5.label}</span>
          </Link>
        ) : (
          <button
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10.5px] font-medium text-white/65"
          >
            <Slot5Icon className="h-[19px] w-[19px]" aria-hidden />
            <span>{bar.slot5.label}</span>
          </button>
        )}
      </nav>

      {bar.slot5.kind === 'more' && moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="เมนูเพิ่มเติม">
          <button aria-label="ปิด" className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 animate-fadeUp rounded-t-2xl border-t border-line bg-card p-4 pb-7 shadow-pop">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" aria-hidden />
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[15px] font-bold">เมนูเพิ่มเติม</div>
              <button aria-label="ปิด" onClick={() => setMoreOpen(false)} className="text-muted-faint">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {bar.slot5.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-[12px] font-semibold transition-colors',
                      active ? 'border-brand bg-[#E4F1EF] text-brand' : 'border-line bg-canvas text-[#4A574F]',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    <span className="leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
