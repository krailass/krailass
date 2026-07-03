import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isValidPin, derivePassword } from '@/lib/pin';

export const runtime = 'nodejs';

// Janitor changes their own PIN (must be unique across the system).
export async function POST(req: NextRequest) {
  const sb = await getSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json()) as { pin?: string };
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

  const { data: dup } = await admin
    .from('profiles')
    .select('id')
    .eq('pin', pin)
    .neq('id', user.id)
    .maybeSingle();
  if (dup) return NextResponse.json({ error: 'PIN นี้มีผู้ใช้แล้ว กรุณาเลือกเลขอื่น' }, { status: 409 });

  const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, {
    password: derivePassword(pin),
  });
  if (pwErr) return NextResponse.json({ error: pwErr.message }, { status: 400 });

  const { error: pinErr } = await admin.from('profiles').update({ pin }).eq('id', user.id);
  if (pinErr) return NextResponse.json({ error: pinErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
