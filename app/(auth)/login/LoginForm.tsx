'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, User, Lock, Delete, KeyRound, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { usernameToEmail } from '@/lib/utils';
import { LOGIN_EMAIL_DOMAIN, SCHOOL } from '@/lib/constants';
import { Button } from '@/components/ui/primitives';

type Mode = 'pin' | 'admin';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = React.useState<Mode>('pin');
  const [loading, setLoading] = React.useState(false);

  function afterLogin() {
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
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-1 shadow-sm">
              <Image src="/logo.png" alt="ตราโรงเรียนสวายวิทยาคาร" width={64} height={64} className="h-full w-full object-contain" priority />
            </div>
            <div className="text-center text-lg font-bold">{SCHOOL.name}</div>
          </div>

          {mode === 'pin' ? (
            <PinLogin loading={loading} setLoading={setLoading} onSuccess={afterLogin} onSwitch={() => setMode('admin')} />
          ) : (
            <AdminLogin loading={loading} setLoading={setLoading} onSuccess={afterLogin} onSwitch={() => setMode('pin')} />
          )}

          <Link
            href="/"
            className="mx-auto mt-8 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-muted-soft transition-colors hover:text-brand"
          >
            <Eye className="h-4 w-4" aria-hidden /> ดูภาพรวมงานนักการ (ไม่ต้องเข้าสู่ระบบ)
          </Link>
        </div>
      </div>
    </div>
  );
}

interface ModeProps {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onSuccess: () => void;
  onSwitch: () => void;
}

function PinLogin({ loading, setLoading, onSuccess, onSwitch }: ModeProps) {
  const [pin, setPin] = React.useState('');

  async function submit(full: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/pin-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin: full }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'รหัส PIN ไม่ถูกต้อง');
        setPin('');
        return;
      }
      onSuccess();
    } catch {
      toast.error('เข้าสู่ระบบไม่สำเร็จ');
      setPin('');
    } finally {
      setLoading(false);
    }
  }

  function press(d: string) {
    if (loading) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) submit(next);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">เข้าสู่ระบบด้วย PIN</h2>
      <p className="mt-1 text-sm text-muted">นักการภารโรง — กรอกรหัส PIN 4 หลักที่ได้รับ</p>

      {/* PIN dots */}
      <div className="mt-7 flex justify-center gap-3.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 transition-colors ${
              i < pin.length ? 'border-brand bg-brand' : 'border-line bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="mx-auto mt-7 grid max-w-[280px] grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            disabled={loading}
            className="flex h-16 items-center justify-center rounded-2xl border border-line bg-card text-2xl font-semibold text-ink transition-colors hover:bg-canvas active:scale-95 disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => press('0')}
          disabled={loading}
          className="flex h-16 items-center justify-center rounded-2xl border border-line bg-card text-2xl font-semibold text-ink transition-colors hover:bg-canvas active:scale-95 disabled:opacity-50"
        >
          0
        </button>
        <button
          onClick={() => !loading && setPin((p) => p.slice(0, -1))}
          disabled={loading}
          aria-label="ลบ"
          className="flex h-16 items-center justify-center rounded-2xl text-muted transition-colors hover:bg-canvas active:scale-95 disabled:opacity-50"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>

      <button
        onClick={onSwitch}
        className="mx-auto mt-7 flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline"
      >
        <User className="h-4 w-4" /> เข้าสู่ระบบด้วยชื่อผู้ใช้ (ผู้ดูแล)
      </button>
    </div>
  );
}

function AdminLogin({ loading, setLoading, onSuccess, onSwitch }: ModeProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

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
    onSuccess();
  }

  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-2xl font-bold">เข้าสู่ระบบ (ผู้ดูแล)</h2>
      <p className="mt-1 text-sm text-muted">กรอกชื่อผู้ใช้และรหัสผ่านที่ได้รับ</p>

      <label className="mb-1.5 mt-6 block text-[12.5px] font-semibold text-[#4A574F]">ชื่อผู้ใช้</label>
      <div className="relative">
        <User className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-faint" />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="เช่น admin"
          className="w-full rounded-[11px] border border-line bg-[#F8FAF7] py-3 pl-10 pr-3 text-sm"
        />
      </div>

      <label className="mb-1.5 mt-4 block text-[12.5px] font-semibold text-[#4A574F]">รหัสผ่าน</label>
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

      <button
        type="button"
        onClick={onSwitch}
        className="mx-auto mt-6 flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline"
      >
        <KeyRound className="h-4 w-4" /> เข้าสู่ระบบด้วย PIN (นักการภารโรง)
      </button>
    </form>
  );
}
