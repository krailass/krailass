'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Save } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { updateTask, type SB } from '@/lib/api';
import { useJanitors, useCategories, useLocations, qk } from '@/hooks/useAppData';
import type { DecoratedTask } from '@/lib/task-view';
import { Button } from '@/components/ui/primitives';
import { Field, Input, Select } from '@/components/ui/form';
import { hhmm } from '@/lib/utils';

interface EditState {
  title: string;
  reporter: string;
  location: string;
  category: string;
  assignee_id: string;
  priority: 'normal' | 'urgent';
  due_date: string;
  assigned_date: string;
  assigned_time: string;
  materials: string;
}

function fromTask(t: DecoratedTask): EditState {
  return {
    title: t.title ?? '',
    reporter: t.reporter ?? '',
    location: t.location ?? '',
    category: t.category ?? '',
    assignee_id: t.assignee_id ?? '',
    priority: t.priority,
    due_date: t.due_date ?? '',
    assigned_date: t.assigned_date ?? '',
    assigned_time: hhmm(t.assigned_time) || '',
    materials: t.materials ?? '',
  };
}

export function EditTaskDialog({ task, onClose }: { task: DecoratedTask | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: janitors = [] } = useJanitors();
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  const [form, setForm] = React.useState<EditState | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(task ? fromTask(task) : null);
  }, [task]);

  function set<K extends keyof EditState>(k: K, v: EditState[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function save() {
    if (!task || !form) return;
    if (!form.title.trim()) {
      toast.error('กรุณากรอกลักษณะงาน');
      return;
    }
    setSaving(true);
    try {
      await updateTask(getSupabaseBrowser() as SB, task.id, {
        title: form.title.trim(),
        reporter: form.reporter || null,
        location: form.location || null,
        category: form.category || null,
        assignee_id: form.assignee_id || null,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_date: form.assigned_date || null,
        assigned_time: form.assigned_time || null,
        materials: form.materials || null,
      });
      await qc.invalidateQueries({ queryKey: qk.tasks });
      toast.success('บันทึกการแก้ไขงานแล้ว');
      onClose();
    } catch (e) {
      toast.error('บันทึกไม่สำเร็จ: ' + (e instanceof Error ? e.message : 'ข้อผิดพลาด'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={task != null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] border border-line bg-card shadow-pop focus:outline-none">
          <div className="flex items-center justify-between border-b border-line p-5">
            <Dialog.Title className="text-[16px] font-bold">แก้ไขงาน</Dialog.Title>
            <Dialog.Close aria-label="ปิด" className="text-muted-faint hover:text-ink">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {form && (
            <div className="overflow-y-auto p-5">
              <Field label="ลักษณะงาน" className="mb-3.5">
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
              </Field>
              <Field label="ผู้แจ้ง / ผู้ขอรับบริการ" className="mb-3.5">
                <Input value={form.reporter} onChange={(e) => set('reporter', e.target.value)} />
              </Field>

              <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
                <Field label="สถานที่">
                  <Input
                    list="edit-location-options"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                  />
                  <datalist id="edit-location-options">
                    {locations.map((l) => (
                      <option key={l.id} value={l.name} />
                    ))}
                  </datalist>
                </Field>
                <Field label="ประเภทงาน">
                  <Input
                    list="edit-category-options"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                  />
                  <datalist id="edit-category-options">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </Field>
              </div>

              <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
                <Field label="ผู้รับผิดชอบ">
                  <Select value={form.assignee_id} onChange={(e) => set('assignee_id', e.target.value)}>
                    <option value="">— เลือกนักการ —</option>
                    {janitors.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.full_name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="ความสำคัญ">
                  <Select
                    value={form.priority}
                    onChange={(e) => set('priority', e.target.value as 'normal' | 'urgent')}
                  >
                    <option value="normal">ปกติ</option>
                    <option value="urgent">เร่งด่วน</option>
                  </Select>
                </Field>
              </div>

              <div className="mb-3.5 grid gap-3.5 sm:grid-cols-3">
                <Field label="กำหนดเสร็จ">
                  <Input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
                </Field>
                <Field label="วันที่มอบหมาย">
                  <Input
                    type="date"
                    value={form.assigned_date}
                    onChange={(e) => set('assigned_date', e.target.value)}
                  />
                </Field>
                <Field label="เวลา">
                  <Input
                    type="time"
                    value={form.assigned_time}
                    onChange={(e) => set('assigned_time', e.target.value)}
                  />
                </Field>
              </div>

              <Field label="วัสดุอุปกรณ์ที่ใช้">
                <Input value={form.materials} onChange={(e) => set('materials', e.target.value)} />
              </Field>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-line p-4">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>
              ยกเลิก
            </Button>
            <Button size="sm" loading={saving} onClick={save}>
              <Save className="h-4 w-4" aria-hidden />
              บันทึก
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
