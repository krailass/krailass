import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { TASK_PHOTOS_BUCKET } from '@/lib/constants';
import type { PublicPhoto } from '@/lib/public-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Signed URLs for one task's before/after photos, for the public detail view.
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('task');
  if (!taskId) return NextResponse.json({ photos: [] });

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ photos: [] });
  }

  const { data: rows } = await admin
    .from('task_photos')
    .select('id,kind,storage_path,sort')
    .eq('task_id', taskId)
    .order('sort');
  const list = rows ?? [];
  if (!list.length) return NextResponse.json({ photos: [] });

  const paths = list.map((r) => r.storage_path);
  const { data: signed } = await admin.storage
    .from(TASK_PHOTOS_BUCKET)
    .createSignedUrls(paths, 60 * 60);
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  const photos: PublicPhoto[] = list.map((r) => ({
    id: r.id,
    kind: r.kind,
    url: urlByPath.get(r.storage_path) || '',
  }));
  return NextResponse.json({ photos });
}
