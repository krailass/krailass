# คู่มือเปิดใช้งาน (Activation runbook)

ระบบโค้ดสมบูรณ์และ **build ผ่าน** แล้ว เหลือขั้นตอนที่ต้องใช้สิทธิ์เข้าถึง Supabase project จริง
(`fobturaedgcxangbaxdh`) และ secrets ซึ่งทำอัตโนมัติในเซสชันนี้ไม่ได้ ทำตามลำดับนี้:

## 0. ข้อควรรู้เรื่อง MCP (สำคัญ)
`.mcp.json` ตั้งค่า Supabase MCP ชี้ project `fobturaedgcxangbaxdh` แล้ว แต่ MCP ที่ **แอ็กทีฟใน
เซสชันนี้กลับชี้ไปที่คนละ project** (`ffurvyqfkaeiwxvjmfan`) จึงยัง **ไม่ได้ apply migration ใด ๆ**
- เปิด Claude Code แบบ interactive แล้วสั่ง `/mcp` เพื่อ **authenticate (OAuth)** เซิร์ฟเวอร์ `supabase`
- ตรวจว่า `get_project_url` คืนค่า `https://fobturaedgcxangbaxdh.supabase.co` ก่อนทำขั้นต่อไปเสมอ

> **ความปลอดภัย:** ปิด "Allow new users to sign up" ใน Supabase → Authentication → Providers/Settings
> ระบบไม่มีหน้าสมัครสมาชิก บัญชีสร้างผ่านแอดมินเท่านั้น (trigger บังคับ role='janitor' อยู่แล้ว
> จึงกันการยกระดับเป็นแอดมินได้ แต่การปิด signup กันบัญชีขยะไปอีกชั้น)

## 1. ตั้งค่า Environment
คัดลอก `.env.example` เป็น `.env.local` แล้วเติมค่า:
```
NEXT_PUBLIC_SUPABASE_URL=https://fobturaedgcxangbaxdh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key ของ project>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server เท่านั้น
NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN=sawai.local
```
คีย์เอาจาก Supabase Dashboard → Project Settings → API (หรือ MCP `get_publishable_keys`).

## 2. Apply migrations (ผ่าน MCP — ยิงที่ project ที่ถูกต้องเท่านั้น)
เรียง apply ตามลำดับไฟล์ใน `supabase/migrations/`:
1. `20260703000001_init_schema.sql`  — enums, tables, RLS, triggers
2. `20260703000002_storage.sql`      — storage buckets + policies
3. `20260703000003_seed_reference.sql` — ประเภทงาน + สถานที่
ใช้ MCP `apply_migration` ทีละไฟล์ จากนั้นรัน `get_advisors` (security + performance) แล้วแก้ตามที่แจ้ง
> ทุกครั้งที่แก้ DB ต่อจากนี้: เขียนไฟล์ใหม่ใน `supabase/migrations/` **แล้วค่อย** apply (ห้าม apply โดยไม่มีไฟล์)

## 3. VAPID keys (Web Push)
```
npm run gen:vapid
```
นำค่า `NEXT_PUBLIC_VAPID_PUBLIC_KEY` และ `VAPID_PRIVATE_KEY` ไปใส่ `.env.local` และ Vercel env

## 4. ใส่ข้อมูลเดโม (แอดมิน + นักการ 6 คน + งาน 14 รายการ)
```
npm run seed
```
บัญชีที่ได้ (รหัสผ่านเริ่มต้น `sawai1234`, เปลี่ยนได้ด้วย env `SEED_PASSWORD`):
- แอดมิน: `admin`
- นักการ: `chanin`, `somchai`, `boonmee`, `sunee`, `wirat`, `prasong`

## 5. รันเครื่อง local
```
npm run dev
```
เปิด http://localhost:3000 → เข้าสู่ระบบด้วย `admin / sawai1234`

## 6. Deploy ขึ้น Vercel (free tier)
1. push โค้ดขึ้น Git repo แล้ว import ใน Vercel (framework: Next.js)
2. ใส่ env ทั้งหมดจากข้อ 1 + 3 ใน Vercel (Production + Preview)
3. Deploy — ระบบเป็น PWA ติดตั้งได้ (ปุ่ม "ติดตั้งแอป" บนเดสก์ท็อป / Add to Home Screen บนมือถือ)

## 7. เพิ่มนักการจริง
เข้าเมนู **จัดการนักการ** (แอดมิน) → กรอกชื่อ + ชื่อผู้ใช้ + รหัสผ่าน → ระบบสร้างบัญชีให้อัตโนมัติ

---
### ตรวจงานตาม requirement
ไอคอน lucide (ไม่ใช้อีโมจิ) · toast (sonner) · modal ยืนยัน (Radix) · PWA+Responsive+ติดตั้งได้ ·
แจ้งเตือน in-app + push · bottom menu จอเล็ก · react-pdf จัดการตัดคำไทย (Sarabun + Intl.Segmenter) ·
แยก role admin/janitor (RLS) · ย่อรูปก่อนอัปโหลด (webp) · Vercel free · SQL เก็บทุกการแก้ DB ·
ภารโรงเห็นงานทั้งหมด+แยกของตัวเอง · หลายรูปตอนรายงาน · สรุป PDF วัน/สัปดาห์/เดือน/ปี รายบุคคล ·
วันที่+เวลามอบหมาย · ชื่อผู้แจ้งท้ายรายงาน
