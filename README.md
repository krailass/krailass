# ระบบจัดการงานนักการภารโรง · โรงเรียนสวายวิทยาคาร

Web app จัดการงานนักการภารโรง/อาคารสถานที่ — **Next.js 15 + Supabase + Vercel**, PWA ติดตั้งได้, UI ภาษาไทย.

- **แผนงาน + สถาปัตยกรรม:** [`CLAUDE.md`](./CLAUDE.md)
- **ขั้นตอนเปิดใช้งาน (apply DB, env, seed, deploy):** [`ACTIVATION.md`](./ACTIVATION.md)
- **Mockup อ้างอิง:** [`ref/`](./ref)

## เริ่มต้น
```bash
npm install
cp .env.example .env.local     # เติมค่า Supabase + VAPID
# apply supabase/migrations/* ผ่าน MCP ไปที่ project fobturaedgcxangbaxdh
npm run seed                   # ใส่ข้อมูลเดโม (admin + นักการ 6 คน + งาน 14)
npm run dev                    # http://localhost:3000  (admin / sawai1234)
```

## สคริปต์
| คำสั่ง | ทำอะไร |
|--------|--------|
| `npm run dev` / `build` / `start` | dev / production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run gen:vapid` | สร้าง VAPID keys สำหรับ Web Push |
| `npm run seed` | ใส่ข้อมูลเดโม (ต้องมี `.env.local` + apply schema แล้ว) |

## Stack
Next.js (App Router) · React 19 · TypeScript · Tailwind v3 · Supabase (Postgres + Auth + Storage + Realtime, RLS) ·
@tanstack/react-query · lucide-react · sonner · Radix Dialog · @react-pdf/renderer (Sarabun + Intl.Segmenter) ·
browser-image-compression · Web Push (VAPID) · Service Worker PWA.

2 บทบาท: **admin** (หัวหน้าอาคารสถานที่) และ **janitor** (นักการภารโรง) แยกสิทธิ์ด้วย RLS.
