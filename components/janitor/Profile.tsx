'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { KeyRound, User, MapPin, Phone, AtSign } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { useProfile } from '@/components/layout/ProfileContext';
import { ROLE_META } from '@/components/layout/nav';
import { Card, Avatar, Button } from '@/components/ui/primitives';
import { Field, Input } from '@/components/ui/form';
import { initial } from '@/lib/utils';
import { LOGIN_EMAIL_DOMAIN } from '@/lib/constants';

const digits = (v: string) => v.replace(/\D/g, '').slice(0, 4);

export function Profile() {
  const { profile } = useProfile();
  const [email, setEmail] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [pin2, setPin2] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSupabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  const username = email.endsWith('@' + LOGIN_EMAIL_DOMAIN) ? email.split('@')[0] : email;

  async function changePin() {
    if (pin.length !== 4) {
      toast.error('PIN ต้องเป็นตัวเลข 4 หลัก');
      return;
    }
    if (pin !== pin2) {
      toast.error('PIN ทั้งสองช่องไม่ตรงกัน');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'เปลี่ยน PIN ไม่สำเร็จ');
      toast.success('เปลี่ยน PIN เรียบร้อย');
      setPin('');
      setPin2('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'เปลี่ยน PIN ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  const rows = [
    { icon: User, label: 'ชื่อ–นามสกุล', value: profile.full_name || '—' },
    { icon: AtSign, label: 'ชื่อผู้ใช้', value: username || '—' },
    { icon: MapPin, label: 'เขต / หน้าที่', value: profile.zone || '—' },
    { icon: Phone, label: 'เบอร์โทร', value: profile.phone || '—' },
  ];

  return (
    <div className="mx-auto grid max-w-3xl animate-fadeUp gap-4 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Avatar name={profile.full_name} initial={initial(profile.full_name)} size={54} />
          <div>
            <div className="text-[16px] font-bold">{profile.full_name}</div>
            <div className="text-[12.5px] text-muted-soft">{ROLE_META[profile.role].label}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-3.5 py-2.5">
                <Icon className="h-[18px] w-[18px] flex-none text-muted-faint" aria-hidden />
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-soft">{r.label}</div>
                  <div className="truncate text-[13.5px] font-semibold">{r.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="h-fit p-6">
        <div className="mb-1 flex items-center gap-2 text-[15px] font-bold">
          <KeyRound className="h-[18px] w-[18px] text-brand" aria-hidden />
          เปลี่ยน PIN
        </div>
        <div className="mb-4 text-[12.5px] text-muted-soft">ตั้ง PIN 4 หลักใหม่สำหรับเข้าใช้งานระบบ</div>
        <Field label="PIN ใหม่ (4 หลัก)" className="mb-3">
          <Input
            value={pin}
            onChange={(e) => setPin(digits(e.target.value))}
            placeholder="เช่น 1234"
            inputMode="numeric"
            className="text-center font-mono text-lg tracking-[0.5em]"
          />
        </Field>
        <Field label="ยืนยัน PIN ใหม่" className="mb-5">
          <Input
            value={pin2}
            onChange={(e) => setPin2(digits(e.target.value))}
            placeholder="พิมพ์ PIN อีกครั้ง"
            inputMode="numeric"
            className="text-center font-mono text-lg tracking-[0.5em]"
          />
        </Field>
        <Button block loading={saving} onClick={changePin}>
          บันทึก PIN ใหม่
        </Button>
      </Card>
    </div>
  );
}
