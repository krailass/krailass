import type { SB } from './api';
import type { PhotoKind } from './database.types';
import { TASK_PHOTOS_BUCKET } from './constants';
import { compressImage } from './image';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function extFor(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/jpeg' || type === 'image/jpg') return 'jpg';
  const sub = type.split('/')[1];
  return sub && /^[a-z0-9]+$/i.test(sub) ? sub : 'jpg';
}

/** Compress, upload to storage, and record task_photos rows. Returns count uploaded. */
export async function uploadTaskPhotos(
  sb: SB,
  taskId: string,
  kind: PhotoKind,
  files: File[],
  uploadedBy: string,
  startSort = 0,
): Promise<number> {
  await Promise.all(
    files.map(async (raw, i) => {
      const file = await compressImage(raw);
      const contentType = file.type || 'image/jpeg';
      const path = `tasks/${taskId}/${kind}/${randomId()}.${extFor(contentType)}`;
      const { error: upErr } = await sb.storage
        .from(TASK_PHOTOS_BUCKET)
        .upload(path, file, { contentType, upsert: false });
      if (upErr) throw upErr;
      const { error: rowErr } = await sb.from('task_photos').insert({
        task_id: taskId,
        kind,
        storage_path: path,
        sort: startSort + i,
        uploaded_by: uploadedBy,
      });
      if (rowErr) throw rowErr;
    }),
  );
  return files.length;
}
