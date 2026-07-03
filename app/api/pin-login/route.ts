import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isValidPin, derivePassword } from '@/lib/pin';
import type { Database } from '@/lib/database.types';

export const runtime = 'nodejs';

// Janitor PIN sign-in: PIN -> find janitor -> sign in with the derived password.
// Cookie writes are bound directly to the returned response so the session
// actually reaches the browser (next/headers cookies() do not propagate onto a
// route-handler's NextResponse.json()).
export async function POST(req: NextRequest) {
  let body: { pin?: string };
  try {
    body = (await req.json()) as { pin?: string };
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const pin = body.pin;
  if (!isValidPin(pin)) {
    return NextResponse.json({ error: 'รหัส PIN ต้องเป็นตัวเลข 4 หลัก' }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: 'service role not configured' }, { status: 500 });
  }

  const { data: prof } = await admin
    .from('profiles')
    .select('id, role, is_active')
    .eq('pin', pin)
    .maybeSingle();

  if (!prof || prof.role !== 'janitor' || !prof.is_active) {
    return NextResponse.json({ error: 'รหัส PIN ไม่ถูกต้อง' }, { status: 401 });
  }

  const { data: userRes } = await admin.auth.admin.getUserById(prof.id as string);
  const email = userRes?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'รหัส PIN ไม่ถูกต้อง' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const sb = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await sb.auth.signInWithPassword({ email, password: derivePassword(pin) });
  if (error) {
    return NextResponse.json({ error: 'รหัส PIN ไม่ถูกต้อง' }, { status: 401 });
  }

  return response;
}
