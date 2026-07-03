import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { usernameToEmail } from '@/lib/utils';
import { LOGIN_EMAIL_DOMAIN } from '@/lib/constants';
import { isValidPin, derivePassword } from '@/lib/pin';

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

// List janitor PINs (admin only) — used by the staff page to display PINs.
export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'forbidden' }, { status: auth.status });
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }
  const { data } = await admin.from('profiles').select('id, pin').eq('role', 'janitor');
  const pins: Record<string, string | null> = {};
  for (const r of data ?? []) pins[r.id as string] = (r.pin as string | null) ?? null;
  return NextResponse.json({ pins });
}

interface CreateBody {
  username?: string;
  pin?: string;
  full_name?: string;
  prefix?: string;
  zone?: string;
  phone?: string;
}

// Create a janitor account with a 4-digit PIN.
export async function POST(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'forbidden' }, { status: auth.status });

  const body = (await req.json()) as CreateBody;
  if (!body.username?.trim() || !body.full_name?.trim()) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }
  if (!isValidPin(body.pin)) {
    return NextResponse.json({ error: 'PIN ต้องเป็นตัวเลข 4 หลัก' }, { status: 400 });
  }
  const pin = body.pin;

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }

  const { data: dup } = await admin.from('profiles').select('id').eq('pin', pin).maybeSingle();
  if (dup) return NextResponse.json({ error: 'PIN นี้มีผู้ใช้แล้ว กรุณาเลือกเลขอื่น' }, { status: 409 });

  const email = usernameToEmail(body.username, LOGIN_EMAIL_DOMAIN);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: derivePassword(pin),
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
    const isDup = /registered|exists/i.test(error.message);
    return NextResponse.json(
      { error: isDup ? 'ชื่อผู้ใช้นี้มีอยู่แล้ว' : error.message },
      { status: isDup ? 409 : 400 },
    );
  }
  if (data.user) await admin.from('profiles').update({ pin }).eq('id', data.user.id);
  return NextResponse.json({ ok: true, id: data.user?.id });
}

// Reset a janitor's PIN (admin).
export async function PATCH(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'forbidden' }, { status: auth.status });

  const { id, pin } = (await req.json()) as { id?: string; pin?: string };
  if (!id || !isValidPin(pin)) {
    return NextResponse.json({ error: 'PIN ต้องเป็นตัวเลข 4 หลัก' }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }

  const { data: dup } = await admin
    .from('profiles')
    .select('id')
    .eq('pin', pin)
    .neq('id', id)
    .maybeSingle();
  if (dup) return NextResponse.json({ error: 'PIN นี้มีผู้ใช้แล้ว กรุณาเลือกเลขอื่น' }, { status: 409 });

  const { error } = await admin.auth.admin.updateUserById(id, { password: derivePassword(pin) });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from('profiles').update({ pin }).eq('id', id);
  return NextResponse.json({ ok: true });
}

// Soft-delete a janitor (is_active=false).
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
