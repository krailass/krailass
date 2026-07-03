'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import {
  createLocation,
  renameLocation,
  deleteLocation,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api';
import { useCategories, useLocations, qk } from '@/hooks/useAppData';
import { CATEGORY_PALETTE } from '@/lib/constants';
import { Button } from '@/components/ui/primitives';
import { Input } from '@/components/ui/form';

type Kind = 'location' | 'category';

export function OptionsManagerDialog({
  kind,
  open,
  onClose,
}: {
  kind: Kind;
  open: boolean;
  onClose: () => void;
}) {
  const isCat = kind === 'category';
  const title = isCat ? 'จัดการประเภทงาน' : 'จัดการสถานที่';
  const qc = useQueryClient();
  const { data: cats = [] } = useCategories();
  const { data: locs = [] } = useLocations();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState(0);
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  const refresh = () =>
    qc.invalidateQueries({ queryKey: isCat ? qk.categories : qk.locations });

  const items = isCat
    ? cats.map((c) => ({ id: c.id, name: c.name, bg: c.color_bg, text: c.color_text }))
    : locs.map((l) => ({ id: l.id, name: l.name, bg: '', text: '' }));

  function startEdit(item: { id: string; name: string; text: string }) {
    setEditingId(item.id);
    setEditName(item.name);
    const idx = CATEGORY_PALETTE.findIndex((p) => p.text === item.text);
    setEditColor(idx >= 0 ? idx : 0);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setBusy(true);
    try {
      const sb = getSupabaseBrowser();
      if (isCat) {
        const c = CATEGORY_PALETTE[editColor];
        await updateCategory(sb, id, { name: editName.trim(), color_bg: c.bg, color_text: c.text });
      } else {
        await renameLocation(sb, id, editName.trim());
      }
      await refresh();
      setEditingId(null);
      toast.success('บันทึกแล้ว');
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    setBusy(true);
    try {
      const sb = getSupabaseBrowser();
      if (isCat) await deleteCategory(sb, id);
      else await deleteLocation(sb, id);
      await refresh();
      toast.success(`ลบ "${name}" แล้ว`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    if (!newName.trim()) {
      toast.error('กรุณากรอกชื่อ');
      return;
    }
    setBusy(true);
    try {
      const sb = getSupabaseBrowser();
      if (isCat) {
        const c = CATEGORY_PALETTE[newColor];
        await createCategory(sb, { name: newName.trim(), color_bg: c.bg, color_text: c.text });
      } else {
        await createLocation(sb, newName.trim());
      }
      await refresh();
      setNewName('');
      toast.success('เพิ่มแล้ว');
    } catch (e) {
      toast.error(/duplicate|unique/i.test(errMsg(e)) ? 'มีรายการนี้อยู่แล้ว' : errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[86vh] w-[94vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-[18px] border border-line bg-card p-5 shadow-pop focus:outline-none">
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-[16px] font-bold">{title}</Dialog.Title>
            <Dialog.Close aria-label="ปิด" className="text-muted-faint">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="-mx-1 flex-1 overflow-y-auto px-1">
            {items.map((item) =>
              editingId === item.id ? (
                <div key={item.id} className="mb-1.5 rounded-xl border border-brand bg-canvas p-2.5">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                  {isCat && <Palette value={editColor} onChange={setEditColor} />}
                  <div className="mt-2 flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                      ยกเลิก
                    </Button>
                    <Button size="sm" loading={busy} onClick={() => saveEdit(item.id)}>
                      <Check className="h-4 w-4" /> บันทึก
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={item.id}
                  className="mb-1.5 flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5"
                >
                  {isCat && (
                    <span
                      className="h-4 w-4 flex-none rounded-md"
                      style={{ background: item.bg, border: `1.5px solid ${item.text}` }}
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{item.name}</span>
                  <button
                    onClick={() => startEdit(item)}
                    aria-label={`แก้ไข ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A6772] hover:bg-canvas"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(item.id, item.name)}
                    aria-label={`ลบ ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-urgent hover:bg-urgent-bg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            )}
            {items.length === 0 && (
              <div className="py-6 text-center text-[13px] text-muted-faint">ยังไม่มีรายการ</div>
            )}
          </div>

          <div className="mt-3 border-t border-line pt-3">
            <div className="mb-1.5 text-[12.5px] font-semibold text-[#4A574F]">
              เพิ่ม{isCat ? 'ประเภทงาน' : 'สถานที่'}ใหม่
            </div>
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={isCat ? 'เช่น งานสวน' : 'เช่น อาคาร 5'}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
              <Button size="md" loading={busy} onClick={add} className="flex-none px-3">
                <Plus className="h-[18px] w-[18px]" />
              </Button>
            </div>
            {isCat && <Palette value={newColor} onChange={setNewColor} />}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Palette({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {CATEGORY_PALETTE.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`สี ${i + 1}`}
          className={`h-7 w-7 rounded-lg transition-transform ${value === i ? 'scale-110 ring-2 ring-offset-1' : ''}`}
          style={{ background: c.bg, border: `2px solid ${c.text}`, boxShadow: value === i ? `0 0 0 2px ${c.text}` : undefined }}
        />
      ))}
    </div>
  );
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ';
}
