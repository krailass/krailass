import { Font } from '@react-pdf/renderer';

let registered = false;

/**
 * Register Sarabun (a complete Thai font) and — crucially — a hyphenation
 * callback that breaks Thai words at real word/character boundaries.
 *
 * Without this, @react-pdf/renderer treats a spaceless Thai line as one
 * unbreakable "word" and CLIPS the final glyph when it overflows. Returning
 * break opportunities lets the layout engine wrap the line correctly, which is
 * exactly the "ตัดคำภาษาไทยตัวสุดท้าย" problem the client called out.
 */
export function registerThaiFonts(): void {
  if (registered) return;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  Font.register({
    family: 'Sarabun',
    fonts: [
      { src: `${origin}/fonts/Sarabun-Regular.ttf`, fontWeight: 400 },
      { src: `${origin}/fonts/Sarabun-Medium.ttf`, fontWeight: 500 },
      { src: `${origin}/fonts/Sarabun-SemiBold.ttf`, fontWeight: 600 },
      { src: `${origin}/fonts/Sarabun-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.registerHyphenationCallback((word) => breakThai(word));
  registered = true;
}

const THAI_RE = /[฀-๿]/;

function breakThai(word: string): string[] {
  // Latin/number words: leave intact (no mid-word hyphenation).
  if (!THAI_RE.test(word)) return [word];

  // Prefer dictionary word segmentation when available.
  const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Seg) {
    try {
      const seg = new Seg('th', { granularity: 'word' });
      const parts = Array.from(seg.segment(word), (s) => s.segment).filter(Boolean);
      if (parts.length > 1) return parts;
    } catch {
      // fall through to character split
    }
  }

  // Fallback: allow a break after every Thai character (keeps combining marks
  // attached to their base is imperfect, but prevents last-glyph clipping).
  return word.split('');
}
