'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, UserPlus, KeyRound } from 'lucide-react';
import { useJanitors, useTasks, qk } from '@/hooks/useAppData';
import { useConfirm } from '@/components/ui/confirm';
import { Card, Avatar, Button } from '@/components/ui/primitives';
import { Field, Input } from '@/components/ui/form';
import { Loading } from '@/components/ui/states';
import { initial } from '@/lib/utils';

interface AddState {
  full_name: string;
  username: string;
  pin: string;
  zone: string;
  phone: string;
}

const BLANK: AddState = { full_name: '', username: '', pin: '', zone: '', phone: '' };
const digits = (v: string) => v.replace(/\D/g, '').slice(0, 4);

function usePins() {
  return useQuery({
    queryKey: ['staff-pins'],
    queryFn: async (): Promise<Record<string, string | null>> => {
      const res = await fetch('/api/staff');
      if (!res.ok) return {};
      const json = await res.json();
      return json.pins ?? {};
    },
  });
}

export function StaffManager() {
  const { data: janitors, isLoading } = useJanitors();
  const { data: tasks = [] } = useTasks();
  const { data: pins = {} } = usePins();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [form, setForm] = React.useState<AddState>(BLANK);
  const [saving, setSaving] = React.useState(false);
  const [pinTarget, setPinTarget] = React.useState<{ id: string; name: string } | null>(null);

  function set<K extends keyof AddState>(k: K, v: AddState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const activeCount = (id: string) =>
    tasks.filter((t) => t.assignee_id === id && t.status !== 'done').length;

  const refreshStaff = async () => {
    await qc.invalidateQueries({ queryKey: qk.janitors });
    await qc.invalidateQueries({ queryKey: qk.profiles });
    await qc.invalidateQueries({ queryKey: ['staff-pins'] });
  };

  async function add() {
    if (!form.full_name.trim() || !form.username.trim() || form.pin.length !== 4) {
      toast.error('กรุณากรอกชื่อ ชื่อผู้ใช้ และ PIN 4 หลัก');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'เพิ่มไม่สำเร็จ');
      await refreshStaff();
      toast.success('เพิ่มนักการภารโรงแล้ว');
      setForm(BLANK);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'เพิ่มไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    const ok = await confirm({
      title: 'ปิดการใช้งานนักการ',
      description: `ต้องการลบ "${name}" ออกจากระบบใช่หรือไม่? บัญชีจะถูกปิดการใช้งาน (เข้าระบบไม่ได้) แต่ประวัติงานยังคงอยู่`,
      confirmText: 'ปิดการใช้งาน',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      const res = await fetch('/api/staff', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'ทำรายการไม่สำเร็จ');
      await refreshStaff();
      toast.success('ปิดการใช้งานแล้ว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    }
  }

  return (
    <div className="grid animate-fadeUp gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-[#F1F4EF] px-[18px] py-4 text-[15px] font-bold">
          รายชื่อนักการภารโรง ({janitors?.length ?? 0})
        </div>
        {isLoading ? (
          <Loading />
        ) : (
          (janitors ?? []).map((j) => (
            <div
              key={j.id}
              className="flex items-center gap-3 border-b border-[#F1F4EF] px-[18px] py-3.5 last:border-b-0"
            >
              <Avatar name={j.full_name} initial={initial(j.full_name)} size={42} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{j.full_name}</div>
                <div className="text-[11.5px] text-muted-soft">
                  {j.zone || '—'} · {j.phone || '—'}
                </div>
              </div>
              <div className="flex-none text-center">
                <div className="font-mono text-[15px] font-bold tracking-widest text-brand">
                  {pins[j.id] ?? '••••'}
                </div>
                <div className="text-[10px] text-muted-faint">PIN</div>
              </div>
              <div className="flex-none text-center">
                <div className="text-[15px] font-bold text-status-progress">{activeCount(j.id)}</div>
                <div className="text-[10px] text-muted-faint">งานค้าง</div>
              </div>
              <button
                onClick={() => setPinTarget({ id: j.id, name: j.full_name })}
                aria-label={`รีเซ็ต PIN ${j.full_name}`}
                className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] border border-line bg-canvas text-[#5A6772] hover:bg-[#eef1ec]"
              >
                <KeyRound className="h-4 w-4" aria-hidden />
              </button>
              <button
                onClick={() => remove(j.id, j.full_name)}
                aria-label={`ปิดการใช้งาน ${j.full_name}`}
                className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] border border-[#F0D9D6] bg-[#FDF3F2] text-urgent hover:bg-[#fbe9e7]"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))
        )}
      </Card>

      <Card className="h-fit p-5">
        <div className="mb-4 text-[15px] font-bold">เพิ่มนักการภารโรง</div>
        <Field label="ชื่อ–นามสกุล" className="mb-3">
          <Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="เช่น นายสมศักดิ์ รักงาน" />
        </Field>
        <Field label="ชื่อผู้ใช้ (ภายในระบบ)" className="mb-3">
          <Input value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="เช่น somsak" autoComplete="off" />
        </Field>
        <Field label="PIN 4 หลัก (ใช้เข้าสู่ระบบ)" className="mb-3">
          <Input
            value={form.pin}
            onChange={(e) => set('pin', digits(e.target.value))}
            placeholder="เช่น 1234"
            inputMode="numeric"
            className="font-mono tracking-[0.4em]"
          />
        </Field>
        <Field label="เขต / หน้าที่" className="mb-3">
          <Input value={form.zone} onChange={(e) => set('zone', e.target.value)} placeholder="เช่น เขตอาคาร 4" />
        </Field>
        <Field label="เบอร์โทร" className="mb-4">
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="08x-xxx-xxxx" />
        </Field>
        <Button block loading={saving} onClick={add}>
          <UserPlus className="h-[18px] w-[18px]" aria-hidden />
          เพิ่มรายชื่อ
        </Button>
      </Card>

      <PinDialog target={pinTarget} onClose={() => setPinTarget(null)} onDone={refreshStaff} />
    </div>
  );
}

function PinDialog({
  target,
  onClose,
  onDone,
}: {
  target: { id: string; name: string } | null;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [pin, setPin] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (target) setPin('');
  }, [target]);

  async function save() {
    if (pin.length !== 4) {
      toast.error('PIN ต้องเป็นตัวเลข 4 หลัก');
      return;
    }
    if (!target) return;
    setSaving(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: target.id, pin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'รีเซ็ต PIN ไม่สำเร็จ');
      await onDone();
      toast.success('รีเซ็ต PIN เรียบร้อย');
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'รีเซ็ต PIN ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={target != null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-line bg-card p-6 shadow-pop focus:outline-none">
          <Dialog.Title className="text-[16px] font-bold">รีเซ็ต PIN</Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] text-muted">
            ตั้ง PIN 4 หลักใหม่ให้ {target?.name}
          </Dialog.Description>
          <div className="mt-4">
            <Input
              value={pin}
              onChange={(e) => setPin(digits(e.target.value))}
              placeholder="PIN 4 หลัก"
              inputMode="numeric"
              className="text-center font-mono text-lg tracking-[0.5em]"
              autoFocus
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button size="sm" loading={saving} onClick={save}>
              บันทึก PIN
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
