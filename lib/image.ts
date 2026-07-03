import imageCompression from 'browser-image-compression';

/**
 * Compress + convert to JPEG before upload. Strips EXIF, caps dimensions.
 *
 * JPEG (not WebP) is deliberate: @react-pdf/renderer — used for the official
 * task report that embeds these photos — only accepts JPEG/PNG. WebP would make
 * every PDF with photos fail. The caller derives the storage extension/content
 * type from the returned File's `type`, so a fallback (original bytes) still
 * uploads with a correct content type.
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.72,
    });
    const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([compressed], `${base}.jpg`, { type: 'image/jpeg' });
  } catch {
    // Fall back to the original file (its real MIME type) if compression fails.
    return file;
  }
}

