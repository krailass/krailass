import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Thai, IBM_Plex_Sans_Thai_Looped } from 'next/font/google';
import { Providers } from './providers';
import { SCHOOL } from '@/lib/constants';
import './globals.css';

const thai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-thai',
  display: 'swap',
});

const thaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ['thai', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-thai-looped',
  display: 'swap',
});

export const metadata: Metadata = {
  title: SCHOOL.name + ' · ระบบจัดการงานนักการภารโรง',
  description: 'ระบบจัดการงานนักการภารโรง อาคารสถานที่ ' + SCHOOL.name,
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'นักการภารโรง' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#0F766E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${thai.variable} ${thaiLooped.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
