import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { usernameToEmail } from '@/lib/utils';
import { LOGIN_EMAIL_DOMAIN } from '@/lib/constants';

export const runtime = 'nodejs';

async function assertAdmin() {
  const sb = await getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { ok: false as const, status: 401 };
  const { data: profile } = await sb
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    return { ok: false as const, status: 403 };
  }
  return { ok: true as const, userId: user.id };
}

interface CreateBody {
  username?: string;
  password?: string;
  full_name?: string;
  prefix?: string;
  zone?: string;
  phone?: string;
}

// Create a janitor account (auth user + profile via trigger).
export async function POST(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'forbidden' }, { status: auth.status });

  const body = (await req.json()) as CreateBody;
  if (!body.username?.trim() || !body.password || !body.full_name?.trim()) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }
  if (body.password.length < 6) {
    return NextResponse.json({ error: 'weak password' }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }

  const email = usernameToEmail(body.username, LOGIN_EMAIL_DOMAIN);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      full_name: body.full_name.trim(),
      prefix: body.prefix ?? '',
      role: 'janitor',
      zone: body.zone ?? '',
      phone: body.phone ?? '',
    },
  });
  if (error) {
    const dup = /registered|exists/i.test(error.message);
    return NextResponse.json(
      { error: dup ? 'ชื่อผู้ใช้นี้มีอยู่แล้ว' : error.message },
      { status: dup ? 409 : 400 },
    );
  }
  return NextResponse.json({ ok: true, id: data.user?.id });
}

// Reset a janitor's password (admin).
export async function PATCH(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'forbidden' }, { status: auth.status });

  const { id, password } = (await req.json()) as { id?: string; password?: string };
  if (!id || !password) return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'weak password' }, { status: 400 });

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }

  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// Soft-delete a janitor (is_active=false). Keeps task history; the auth guard
// (getSessionProfile) blocks inactive users from using the app.
export async function DELETE(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'forbidden' }, { status: auth.status });

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  if (id === auth.userId) {
    return NextResponse.json({ error: 'ปิดใช้งานบัญชีตนเองไม่ได้' }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }

  const { error } = await admin.from('profiles').update({ is_active: false }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
