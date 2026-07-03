'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Settings2 } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { createTask, createLocation, createCategory } from '@/lib/api';
import { notify } from '@/lib/notify';
import { useJanitors, useCategories, useLocations, qk } from '@/hooks/useAppData';
import { useProfile } from '@/components/layout/ProfileContext';
import { CATEGORY_PALETTE } from '@/lib/constants';
import { Card, Button } from '@/components/ui/primitives';
import { Field, Input, Select } from '@/components/ui/form';
import { OptionsManagerDialog } from './OptionsManagerDialog';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

interface FormState {
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

export function AssignForm() {
  const { userId } = useProfile();
  const qc = useQueryClient();
  const { data: janitors = [] } = useJanitors();
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  const [saving, setSaving] = React.useState(false);
  const [manager, setManager] = React.useState<'location' | 'category' | null>(null);

  const [form, setForm] = React.useState<FormState>({
    title: '',
    reporter: '',
    location: '',
    category: '',
    assignee_id: '',
    priority: 'normal',
    due_date: '',
    assigned_date: today(),
    assigned_time: nowTime(),
    materials: '',
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Prefill from the calendar's "assign for this day" action (?date=&assignee=).
  const params = useSearchParams();
  const prefilledRef = React.useRef(false);
  React.useEffect(() => {
    if (prefilledRef.current) return;
    prefilledRef.current = true;
    const date = params.get('date');
    const asg = params.get('assignee');
    if (date || asg) {
      setForm((f) => ({
        ...f,
        ...(date ? { assigned_date: date } : {}),
        ...(asg && asg !== 'all' ? { assignee_id: asg } : {}),
      }));
    }
  }, [params]);

  async function submit() {
    if (!form.title.trim()) {
      toast.error('กรุณากรอกลักษณะงาน');
      return;
    }
    if (!form.assignee_id) {
      toast.error('กรุณาเลือกผู้รับผิดชอบ');
      return;
    }
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();

      // Auto-add newly typed location / category to their pickers (best-effort).
      const loc = form.location.trim();
      if (loc && !locations.some((l) => l.name === loc)) {
        try {
          await createLocation(sb, loc);
          qc.invalidateQueries({ queryKey: qk.locations });
        } catch {
          /* duplicate or RLS — ignore, task still saves */
        }
      }
      const cat = form.category.trim();
      if (cat && !categories.some((c) => c.name === cat)) {
        try {
          const c = CATEGORY_PALETTE[categories.length % CATEGORY_PALETTE.length];
          await createCategory(sb, { name: cat, color_bg: c.bg, color_text: c.text });
          qc.invalidateQueries({ queryKey: qk.categories });
        } catch {
          /* ignore */
        }
      }

      const task = await createTask(
        sb,
        {
          title: form.title.trim(),
          reporter: form.reporter || undefined,
          location: form.location || undefined,
          category: form.category || undefined,
          assignee_id: form.assignee_id,
          priority: form.priority,
          due_date: form.due_date || null,
          assigned_date: form.assigned_date || null,
          assigned_time: form.assigned_time || null,
          materials: form.materials || undefined,
        },
        userId,
      );
      await qc.invalidateQueries({ queryKey: qk.tasks });
      notify({
        target: { userId: form.assignee_id },
        title: 'ได้รับมอบหมายงานใหม่',
        body: form.title.trim(),
        taskId: task.id,
        type: 'assigned',
      });
      toast.success('มอบหมายงานใหม่เรียบร้อย');
      setForm((f) => ({
        ...f,
        title: '',
        reporter: '',
        materials: '',
        due_date: '',
        assigned_date: today(),
        assigned_time: nowTime(),
      }));
    } catch (e) {
      toast.error('บันทึกไม่สำเร็จ: ' + (e instanceof Error ? e.message : 'ข้อผิดพลาด'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl animate-fadeUp">
      <Card className="p-6">
        <div className="mb-5 text-[15.5px] font-bold">สร้างและมอบหมายงานใหม่ให้นักการภารโรง</div>

        <Field label="ลักษณะงาน" className="mb-4">
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="เช่น ซ่อมประตูห้องเรียน 214"
          />
        </Field>

        <Field label="ผู้แจ้ง / ผู้ขอรับบริการ" className="mb-4">
          <Input
            value={form.reporter}
            onChange={(e) => set('reporter', e.target.value)}
            placeholder="เช่น ครูสมหญิง (ห้อง 214)"
          />
        </Field>

        <div className="mb-4 grid gap-3.5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#4A574F]">สถานที่</span>
              <button
                type="button"
                onClick={() => setManager('location')}
                aria-label="จัดการรายการสถานที่"
                className="flex items-center gap-1 text-[11.5px] font-semibold text-brand hover:underline"
              >
                <Settings2 className="h-3.5 w-3.5" /> จัดการ
              </button>
            </div>
            <Input
              list="location-options"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="เลือกหรือพิมพ์สถานที่"
            />
            <datalist id="location-options">
              {locations.map((l) => (
                <option key={l.id} value={l.name} />
              ))}
            </datalist>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#4A574F]">ประเภทงาน</span>
              <button
                type="button"
                onClick={() => setManager('category')}
                aria-label="จัดการรายการประเภทงาน"
                className="flex items-center gap-1 text-[11.5px] font-semibold text-brand hover:underline"
              >
                <Settings2 className="h-3.5 w-3.5" /> จัดการ
              </button>
            </div>
            <Input
              list="category-options"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="เลือกหรือพิมพ์ประเภท"
            />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="mb-4 grid gap-3.5 sm:grid-cols-3">
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
          <Field label="กำหนดเสร็จ">
            <Input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
          </Field>
        </div>

        <div className="mb-4 grid gap-3.5 sm:grid-cols-2">
          <Field label="วันที่มอบหมาย">
            <Input
              type="date"
              value={form.assigned_date}
              onChange={(e) => set('assigned_date', e.target.value)}
            />
          </Field>
          <Field label="เวลาที่มอบหมาย">
            <Input
              type="time"
              value={form.assigned_time}
              onChange={(e) => set('assigned_time', e.target.value)}
            />
          </Field>
        </div>

        <Field label="วัสดุอุปกรณ์ที่ใช้ (ถ้ามี)" className="mb-5">
          <Input
            value={form.materials}
            onChange={(e) => set('materials', e.target.value)}
            placeholder="เช่น บานพับ, สกรู, ไขควง"
          />
        </Field>

        <Button size="lg" block loading={saving} onClick={submit}>
          <Plus className="h-[18px] w-[18px]" aria-hidden />
          มอบหมายงาน
        </Button>
      </Card>

      <OptionsManagerDialog
        kind="location"
        open={manager === 'location'}
        onClose={() => setManager(null)}
      />
      <OptionsManagerDialog
        kind="category"
        open={manager === 'category'}
        onClose={() => setManager(null)}
      />
    </div>
  );
}
