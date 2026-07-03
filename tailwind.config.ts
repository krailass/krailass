import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand + surfaces (mirrors the mockup)
        canvas: '#EEF1EC',
        ink: '#16231F',
        card: '#FFFFFF',
        line: '#E7EAE4',
        brand: {
          DEFAULT: '#0F766E',
          dark: '#134E48',
          sidebar: '#0E3B36',
        },
        accent: '#22C55E',
        muted: {
          DEFAULT: '#7A867E',
          soft: '#8A968E',
          faint: '#9AA79F',
        },
        // Status
        status: {
          pending: '#5A6772',
          pendingBg: '#EEF1F4',
          pendingDot: '#94A3B8',
          progress: '#B45309',
          progressBg: '#FDF1E1',
          progressDot: '#F59E0B',
          done: '#0F7A45',
          doneBg: '#E4F4EC',
          doneDot: '#22C55E',
        },
        urgent: { DEFAULT: '#C0362C', bg: '#FDECEC' },
      },
      fontFamily: {
        sans: ['var(--font-thai)', 'IBM Plex Sans Thai', 'system-ui', 'sans-serif'],
        looped: ['var(--font-thai-looped)', 'IBM Plex Sans Thai Looped', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,40,34,.04), 0 14px 30px -24px rgba(16,40,34,.3)',
        soft: '0 1px 2px rgba(16,40,34,.04)',
        pop: '0 12px 30px -10px rgba(0,0,0,.35)',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        toastIn: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeUp: 'fadeUp .3s ease',
        toastIn: 'toastIn .25s ease',
      },
    },
  },
  plugins: [],
};

export default config;
