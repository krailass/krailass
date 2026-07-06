import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { PublicTask } from '@/lib/public-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public, login-free overview of janitor work. Uses the service-role client on
// the server only; returns a sanitized subset (no phone/pin/email) so the data
// is safe to show on the anonymous landing page.
export async function GET() {
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 500 });
  }

  const { data: rows, error } = await admin
    .from('tasks')
    .select(
      'id,title,category,location,status,approval,priority,assignee_id,reporter,assigned_date,due_date,due_text,completed_at,note,place,materials,time_start,time_end',
    )
    .order('assigned_date', { ascending: false, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = rows ?? [];
  const ids = [...new Set(list.map((r) => r.assignee_id).filter((v): v is string => !!v))];
  const nameById = new Map<string, string>();
  if (ids.length) {
    const { data: profs } = await admin.from('profiles').select('id,full_name').in('id', ids);
    for (const p of profs ?? []) nameById.set(p.id, p.full_name ?? '—');
  }

  const tasks: PublicTask[] = list.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    location: t.location,
    status: t.status,
    approval: t.approval,
    priority: t.priority,
    assigneeName: (t.assignee_id && nameById.get(t.assignee_id)) || '—',
    reporter: t.reporter,
    assigned_date: t.assigned_date,
    due_date: t.due_date,
    due_text: t.due_text,
    completed_at: t.completed_at,
    note: t.note,
    place: t.place,
    materials: t.materials,
    time_start: t.time_start,
    time_end: t.time_end,
  }));

  return NextResponse.json({ tasks });
}
