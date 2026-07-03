import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendPush, type PushSub } from '@/lib/push-server';

export const runtime = 'nodejs';

interface NotifyBody {
  target?: { userId?: string; role?: 'admin' };
  title?: string;
  body?: string;
  taskId?: string;
  type?: string;
}

export async function POST(req: NextRequest) {
  const sb = await getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let payload: NotifyBody;
  try {
    payload = (await req.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  if (!payload.title || !payload.target) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  // Authorization: admins may notify anyone; a non-admin may only notify the
  // admins, and only about a task they are assigned to (prevents spam/spoofing).
  const { data: caller } = await sb
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
  const isAdmin = !!caller && caller.role === 'admin' && caller.is_active;

  if (!isAdmin) {
    if (payload.target.role !== 'admin' || !payload.taskId) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const { data: owned } = await sb
      .from('tasks')
      .select('id')
      .eq('id', payload.taskId)
      .eq('assignee_id', user.id)
      .maybeSingle();
    if (!owned) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const title = String(payload.title).slice(0, 140);
  const body = payload.body ? String(payload.body).slice(0, 300) : null;

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }

  // Resolve recipients
  let userIds: string[] = [];
  if (payload.target.userId) {
    userIds = [payload.target.userId];
  } else if (payload.target.role === 'admin') {
    const { data } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true);
    userIds = (data ?? []).map((r) => r.id as string);
  }
  if (userIds.length === 0) return NextResponse.json({ ok: true, recipients: 0 });

  // In-app notifications
  await admin.from('notifications').insert(
    userIds.map((uid) => ({
      user_id: uid,
      type: payload.type || 'info',
      title,
      body,
      task_id: payload.taskId ?? null,
    })),
  );

  // Web Push
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint,p256dh,auth')
    .in('user_id', userIds);

  const isUrgent = payload.type === 'urgent';
  const dead = await sendPush((subs ?? []) as PushSub[], {
    title,
    body: body ?? undefined,
    taskId: payload.taskId ?? null,
    url: isUrgent ? '/janitor/board' : '/',
    urgent: isUrgent,
  });

  if (dead.length) {
    await admin.from('push_subscriptions').delete().in('endpoint', dead);
  }

  return NextResponse.json({ ok: true, recipients: userIds.length });
}
