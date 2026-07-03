'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { usernameToEmail } from '@/lib/utils';
import { LOGIN_EMAIL_DOMAIN, SCHOOL } from '@/lib/constants';
import { Button } from '@/components/ui/primitives';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    setLoading(true);
    const email = usernameToEmail(username, LOGIN_EMAIL_DOMAIN);
    const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error('เข้าสู่ระบบไม่สำเร็จ ตรวจสอบชื่อผู้ใช้หรือรหัสผ่าน');
      return;
    }
    toast.success('ยินดีต้อนรับ');
    router.replace(params.get('next') || '/');
    router.refresh();
  }

  return (
    <div className="grid min-h-screen bg-canvas md:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col items-center justify-center bg-gradient-to-br from-brand to-brand-sidebar p-12 text-center text-white md:flex">
        <div className="mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] bg-white p-2.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,.35)]">
          <Image
            src="/logo.png"
            alt="ตราโรงเรียนสวายวิทยาคาร"
            width={112}
            height={112}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <div className="text-[26px] font-bold">{SCHOOL.name}</div>
        <h1 className="mt-3 font-looped text-2xl font-bold leading-snug">ระบบจัดการงานนักการภารโรง</h1>
        <p className="mt-3 max-w-sm text-white/80">
          บริหารงานอาคารสถานที่ มอบหมาย ติดตาม รายงานผล และอนุมัติงาน — ครบในที่เดียว
        </p>
        <div className="absolute bottom-8 text-sm text-white/60">{SCHOOL.dept}</div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-1 shadow-sm">
              <Image
                src="/logo.png"
                alt="ตราโรงเรียนสวายวิทยาคาร"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="text-center text-lg font-bold">{SCHOOL.name}</div>
          </div>
          <h2 className="text-2xl font-bold">เข้าสู่ระบบ</h2>
          <p className="mt-1 text-sm text-muted">กรอกชื่อผู้ใช้และรหัสผ่านที่ได้รับจากผู้ดูแล</p>

          <label className="mb-1.5 mt-6 block text-[12.5px] font-semibold text-[#4A574F]">
            ชื่อผู้ใช้
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-faint" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="เช่น chanin"
              className="w-full rounded-[11px] border border-line bg-[#F8FAF7] py-3 pl-10 pr-3 text-sm"
            />
          </div>

          <label className="mb-1.5 mt-4 block text-[12.5px] font-semibold text-[#4A574F]">
            รหัสผ่าน
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-faint" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-[11px] border border-line bg-[#F8FAF7] py-3 pl-10 pr-3 text-sm"
            />
          </div>

          <Button type="submit" size="lg" block loading={loading} className="mt-7">
            <LogIn className="h-[18px] w-[18px]" aria-hidden />
            เข้าสู่ระบบ
          </Button>
        </form>
      </div>
    </div>
  );
}
