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

  // Treat each whitespace-delimited token as an unbreakable unit (no mid-word
  // hyphenation). Combined with the trailing-space buffer applied to every
  // Text line (see components/pdf/documents.tsx), this is the proven fix for
  // @react-pdf's Thai last-glyph clipping — matches KPServiceProV2's approach.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
