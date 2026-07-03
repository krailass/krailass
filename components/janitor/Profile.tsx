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

export function Profile() {
  const { profile } = useProfile();
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSupabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  const username = email.endsWith('@' + LOGIN_EMAIL_DOMAIN) ? email.split('@')[0] : email;

  async function changePassword() {
    if (pw.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (pw !== pw2) {
      toast.error('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    setSaving(true);
    const { error } = await getSupabaseBrowser().auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      toast.error('เปลี่ยนรหัสผ่านไม่สำเร็จ: ' + error.message);
      return;
    }
    toast.success('เปลี่ยนรหัสผ่านเรียบร้อย');
    setPw('');
    setPw2('');
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
          เปลี่ยนรหัสผ่าน
        </div>
        <div className="mb-4 text-[12.5px] text-muted-soft">ตั้งรหัสผ่านใหม่สำหรับเข้าใช้งานระบบ</div>
        <Field label="รหัสผ่านใหม่" className="mb-3">
          <Input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            autoComplete="new-password"
          />
        </Field>
        <Field label="ยืนยันรหัสผ่านใหม่" className="mb-5">
          <Input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            autoComplete="new-password"
          />
        </Field>
        <Button block loading={saving} onClick={changePassword}>
          บันทึกรหัสผ่านใหม่
        </Button>
      </Card>
    </div>
  );
}
