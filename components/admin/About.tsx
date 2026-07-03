'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Smartphone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/primitives';
import { SCHOOL } from '@/lib/constants';

export function About() {
  const [origin, setOrigin] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = origin ? `${origin}/dashboard` : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('คัดลอกลิงก์แล้ว');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('คัดลอกไม่สำเร็จ');
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fadeUp">
      <Card className="p-6 text-center">
        <div className="mb-1 flex items-center justify-center gap-2 text-[15px] font-bold">
          <Smartphone className="h-[18px] w-[18px] text-brand" aria-hidden />
          สแกนเพื่อเปิดระบบ
        </div>
        <div className="mb-5 text-[12.5px] text-muted-soft">
          ใช้กล้องมือถือสแกน QR Code เพื่อเปิดหน้าแดชบอร์ดของระบบ
        </div>

        <div className="mx-auto flex w-fit items-center justify-center rounded-2xl border border-line bg-white p-4 shadow-soft">
          {link ? (
            <QRCodeSVG
              value={link}
              size={220}
              level="M"
              marginSize={2}
              fgColor="#134E48"
              bgColor="#FFFFFF"
            />
          ) : (
            <div className="h-[220px] w-[220px]" />
          )}
        </div>

        <div className="mx-auto mt-6 max-w-md">
          <div className="mb-1.5 text-left text-[12.5px] font-semibold text-[#4A574F]">ลิงก์เข้าระบบ</div>
          <div className="flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-[11px] border border-line bg-[#F8FAF7] px-3 text-[13px] text-ink">
              <span className="truncate">{link || '—'}</span>
            </div>
            <button
              onClick={copy}
              className="flex flex-none items-center gap-1.5 rounded-[11px] bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-dark"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
            </button>
          </div>
          <a
            href={link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> เปิดในแท็บใหม่
          </a>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <div className="text-[15px] font-bold">เกี่ยวกับระบบ</div>
        <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-[#4A574F]">
          <div>ระบบจัดการงานนักการภารโรง · อาคารสถานที่</div>
          <div className="font-semibold">{SCHOOL.name}</div>
          <div className="text-muted-soft">{SCHOOL.dept}</div>
        </div>
        <div className="mt-4 rounded-xl border border-line bg-canvas p-3 text-[12px] leading-relaxed text-muted">
          หมายเหตุ: ลิงก์และ QR จะอ้างอิงที่อยู่ (URL) ที่คุณกำลังเปิดใช้งานอยู่ — หากใช้งานผ่านเครือข่าย
          ภายในให้เชื่อมต่อ Wi-Fi วงเดียวกัน หรือเมื่อขึ้นระบบจริงบนอินเทอร์เน็ตแล้ว QR จะเปิดได้จากทุกที่
        </div>
      </Card>
    </div>
  );
}
