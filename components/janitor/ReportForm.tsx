'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { submitReport, type SB } from '@/lib/api';
import { uploadTaskPhotos } from '@/lib/photos';
import { notify } from '@/lib/notify';
import { useTasks, qk } from '@/hooks/useAppData';
import { useProfile } from '@/components/layout/ProfileContext';
import { Card, Button } from '@/components/ui/primitives';
import { Field, Input, Textarea, Select } from '@/components/ui/form';
import { Loading } from '@/components/ui/states';
import { PhotoUploader } from './PhotoUploader';

interface Fields {
  place: string;
  materials: string;
  note: string;
  time_start: string;
  time_end: string;
}

export function ReportForm() {
  const { userId } = useProfile();
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const { data: tasks, isLoading } = useTasks();

  const [taskId, setTaskId] = React.useState<string>('');
  const [fields, setFields] = React.useState<Fields>({
    place: '',
    materials: '',
    note: '',
    time_start: '',
    time_end: '',
  });
  const [before, setBefore] = React.useState<File[]>([]);
  const [after, setAfter] = React.useState<File[]>([]);
  const [saving, setSaving] = React.useState(false);

  const mine = React.useMemo(
    () => (tasks ?? []).filter((t) => t.assignee_id === userId && t.status !== 'done'),
    [tasks, userId],
  );

  // Preselect from ?task= exactly once (after tasks load). A ref guard prevents
  // background ['tasks'] refetches from clobbering the user's manual selection.
  const preselectedRef = React.useRef(false);
  React.useEffect(() => {
    if (preselectedRef.current || !tasks) return;
    const q = params.get('task');
    if (q && mine.some((t) => t.id === q)) {
      preselectedRef.current = true;
      setTaskId(q);
      const t = mine.find((x) => x.id === q);
      if (t) {
        setFields((f) => ({
          ...f,
          place: t.place || t.location || '',
          materials: t.materials || '',
          note: t.note || '',
        }));
      }
    } else if (mine.length > 0) {
      // Tasks are loaded but there's no valid ?task= to apply — stop trying.
      preselectedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, params]);

  function set<K extends keyof Fields>(k: K, v: Fields[K]) {
    setFields((f) => ({ ...f, [k]: v }));
  }

  function onPickTask(id: string) {
    setTaskId(id);
    const t = mine.find((x) => x.id === id);
    setFields((f) => ({
      ...f,
      place: t?.place || t?.location || '',
      materials: t?.materials || '',
      note: t?.note || '',
    }));
  }

  async function submit() {
    if (!taskId) {
      toast.error('กรุณาเลือกงานที่จะรายงาน');
      return;
    }
    setSaving(true);
    try {
      const sb = getSupabaseBrowser() as SB;
      if (before.length) await uploadTaskPhotos(sb, taskId, 'before', before, userId);
      if (after.length) await uploadTaskPhotos(sb, taskId, 'after', after, userId);
      await submitReport(sb, taskId, {
        place: fields.place,
        materials: fields.materials,
        note: fields.note,
        time_start: fields.time_start,
        time_end: fields.time_end,
      });
      await qc.invalidateQueries({ queryKey: qk.tasks });
      const t = mine.find((x) => x.id === taskId);
      notify({
        target: { role: 'admin' },
        title: 'มีงานรายงานเสร็จรอตรวจ',
        body: t?.title,
        taskId,
        type: 'reported',
      });
      toast.success('ส่งรายงานเรียบร้อย รอหัวหน้าตรวจ');
      router.push('/janitor/board');
    } catch (e) {
      toast.error('ส่งรายงานไม่สำเร็จ: ' + (e instanceof Error ? e.message : 'ข้อผิดพลาด'));
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-3xl animate-fadeUp">
      <Card className="p-6">
        <div className="text-[15.5px] font-bold">รายงานผลการปฏิบัติงานที่ได้รับมอบหมาย</div>
        <div className="mb-4 mt-1 text-[12.5px] text-muted-soft">
          กรอกผลการทำงาน แนบภาพก่อน–หลัง แล้วส่งให้หัวหน้าอาคารสถานที่ตรวจ
        </div>

        <Field label="เลือกงานที่จะรายงาน" className="mb-4">
          <Select value={taskId} onChange={(e) => onPickTask(e.target.value)}>
            <option value="">— เลือกงาน —</option>
            {mine.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
        </Field>

        <div className="mb-4 grid gap-3.5 sm:grid-cols-2">
          <Field label="สถานที่ปฏิบัติงาน">
            <Input value={fields.place} onChange={(e) => set('place', e.target.value)} />
          </Field>
          <Field label="วัสดุอุปกรณ์ที่ใช้">
            <Input value={fields.materials} onChange={(e) => set('materials', e.target.value)} />
          </Field>
        </div>

        <Field label="ลักษณะงาน / รายละเอียด" className="mb-4">
          <Textarea rows={3} value={fields.note} onChange={(e) => set('note', e.target.value)} />
        </Field>

        <div className="mb-5 grid gap-3.5 sm:grid-cols-2">
          <Field label="เริ่มเวลา">
            <Input type="time" value={fields.time_start} onChange={(e) => set('time_start', e.target.value)} />
          </Field>
          <Field label="สิ้นสุดเวลา">
            <Input type="time" value={fields.time_end} onChange={(e) => set('time_end', e.target.value)} />
          </Field>
        </div>

        <div className="mb-4">
          <PhotoUploader label="ภาพก่อนดำเนินการ" files={before} onChange={setBefore} />
        </div>
        <div className="mb-2">
          <PhotoUploader label="ภาพหลังดำเนินการ" files={after} onChange={setAfter} />
        </div>

        <Button size="lg" block loading={saving} onClick={submit} className="mt-5">
          <Send className="h-[18px] w-[18px]" aria-hidden />
          ส่งรายงานการปฏิบัติงาน
        </Button>
      </Card>
    </div>
  );
}
