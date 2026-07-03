# ระบบจัดการงานนักการภารโรง — โรงเรียนสวายวิทยาคาร

> Janitor / custodial work-management system for Sawai Wittayakan School.
> Web app on **Vercel (free tier) + Supabase**, installable **PWA**, Thai UI.
> This file is the source-of-truth plan. Keep it updated as the build progresses.

---

## 1. Product summary

A role-based system for managing custodial work orders across the school. Building-and-grounds
supervisors (admin) create and assign work, janitors report progress with before/after photos,
and supervisors inspect and approve. Everything is summarised into dashboards, statistics, and
two official Thai PDF documents.

**Reference mockup:** `ref/ระบบจัดการนักการภารโรง/*.dc.html` — a complete standalone React
mockup. It is the visual + behavioural source of truth. The real app reproduces its design and
data model on Supabase with real auth, storage, PDF, PWA, and push.

`ref/สรุปการปฏิบัติงาน2569-06-30.pdf` — sample of the official printed report to match.

---

## 2. Roles (real auth — 2 roles)

The mockup exposes three *perspectives* (Dashboard / Janitor / Admin). In production these map to
**two authenticated roles**:

| Role | Sees | Can do |
|------|------|--------|
| **admin** (หัวหน้าอาคารสถานที่ / ผู้บริหาร) | Dashboard (overview + per-person), all tasks, assign, staff CRUD, approve queue, PDF | Everything |
| **janitor** (นักการภารโรง) | All tasks (read) + own board, report form, own stats/PDF | Advance own tasks, submit reports w/ photos |

- Janitors **see all work** but their board/report/stats are **filtered to themselves** (requirement).
- The "Dashboard/executive" perspective is the **admin landing view** (not a separate login).
- RLS enforces this at the database; the UI hides what a role can't use.

---

## 3. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** | Deploys to Vercel free tier |
| Styling | **Tailwind CSS v4** + design tokens | Tokens mirror the mockup palette |
| Backend | **Supabase**: Postgres + Auth + Storage + Realtime | RLS on every table |
| Auth client | **@supabase/ssr** | Cookie-based SSR sessions + middleware |
| Server state | **@tanstack/react-query** | + Supabase Realtime for live board |
| Icons | **lucide-react** | line icons — **never emoji** |
| Toasts | **sonner** | replaces all `alert()` |
| Modals | **@radix-ui/react-dialog** + styled | accessible confirm/ask dialogs |
| PDF | **@react-pdf/renderer** | Thai font + word-segmentation (see §7) |
| Image compress | **browser-image-compression** | shrink before upload (see §8) |
| PWA | **@serwist/next** (service worker + manifest) | installable, offline shell |
| Push | **web-push** (VAPID) via Next Route Handler | in-app + Web Push (see §9) |

**Design skills applied:** `react-best-practices` (RSC/data-fetching/re-render rules) and
`supabase-postgres-best-practices` (indexing, RLS, security-definer) are the standing guidance for
all code and schema in this repo.

---

## 4. Design system (from mockup — do not drift)

```
Primary teal        #0F766E   (dark #134E48)
Sidebar (dark)      #0E3B36
Accent green        #22C55E
App background      #EEF1EC
Card background     #FFFFFF   border #E7EAE4   radius 16px
Text                #16231F   muted #7A867E / #8A968E / #9AA79F

Status  pending   text #5A6772  bg #EEF1F4  dot #94A3B8   "ยังไม่ดำเนินงาน"
        progress  text #B45309  bg #FDF1E1  dot #F59E0B   "กำลังดำเนินงาน"
        done      text #0F7A45  bg #E4F4EC  dot #22C55E   "ดำเนินการแล้ว"

Category colors (bg / text):
  ซ่อมแซม        #EAF0FB / #2456B8
  บำรุงรักษา      #F0EDFB / #6B45C4
  ปรับปรุง        #FBEFEA / #B85526
  ทำความสะอาด    #E7F3F6 / #1E7A8C
  ไฟฟ้า-ประปา     #FBF3E1 / #9A6B12
  ดูแลภูมิทัศน์     #E9F4E6 / #3B7A2E

Font: IBM Plex Sans Thai (300–700), 'IBM Plex Sans Thai Looped' for big numerals.
Toast: dark pill #16231F bottom-center. Urgent badge: #FDECEC / #C0362C ("เร่งด่วน").
```

**Responsive:** desktop = left dark sidebar (236px). Mobile (`< 860px`) = **bottom nav bar**
(requirement: "จอเล็กใช้ bottom menu"). Print styles hide chrome and lay out A4 sheets.

---

## 5. Data model (Postgres)

Enums: `user_role(admin,janitor)`, `task_status(pending,progress,done)`,
`approval_status(waiting,approved)`, `task_priority(normal,urgent)`, `photo_kind(before,after)`.

**profiles** (1:1 `auth.users`) — id, full_name, prefix, role, zone, phone, avatar_url, is_active, created_at
**categories** — id, name (unique), color_bg, color_text, sort
**locations** — id, name (unique), sort
**tasks** — id, title, reporter, location, category, assignee_id→profiles, status, approval,
  priority, due_text, due_date, assigned_date, assigned_time, materials, place, time_start,
  time_end, note, created_by→profiles, approved_by→profiles, approved_at, completed_at,
  created_at, updated_at
**task_photos** — id, task_id→tasks(on delete cascade), kind(before/after), storage_path, sort,
  uploaded_by→profiles, created_at  *(separate table ⇒ "เพิ่มจำนวนรูป" is unbounded)*
**notifications** — id, user_id→profiles, type, title, body, task_id, is_read, created_at
**push_subscriptions** — id, user_id→profiles, endpoint(unique), p256dh, auth, user_agent, created_at

Indexes on all FKs + `tasks(status)`, `tasks(assignee_id)`, `tasks(assigned_date)`,
`notifications(user_id,is_read)`. `updated_at` maintained by trigger.

### RLS (enabled on every table)
- **profiles**: `select` any authenticated (names needed for assignment). `update/insert/delete` admin only; a janitor may update own limited fields.
- **tasks**: `select` any authenticated (janitors see all work). `insert/update/delete` admin. Janitor may `update` a row where `assignee_id = auth.uid()` — column-level guard via trigger so janitors can change only status/report fields, never `assignee_id`/`approval`/`priority`.
- **task_photos**: `select` authenticated. `insert/delete` by the task's assignee or admin.
- **notifications**: user reads/updates own only.
- **push_subscriptions**: user manages own only.
- `is_admin()` = `SECURITY DEFINER` helper reading the caller's role (avoids RLS recursion).

### Storage
- Bucket **task-photos** (private) — path `tasks/{task_id}/{before|after}/{uuid}.webp`; policies mirror `task_photos` RLS. Signed URLs for display.
- Bucket **avatars** (public, optional).

---

## 6. DB change workflow (MANDATORY)

Every schema change is **both** a file **and** an applied migration:
1. Write `supabase/migrations/<timestamp>_<name>.sql` (idempotent where practical).
2. Apply via the **`supabase` MCP** (`apply_migration`) — **target project `fobturaedgcxangbaxdh` only**.
3. `mcp.get_advisors(security|performance)` after, fix findings.
4. Regenerate `lib/database.types.ts` via MCP `generate_typescript_types`.

⚠️ **Target verification:** the MCP server *currently active in-session* points to
`ffurvyqfkaeiwxvjmfan` (a different project). The correct project-scoped server is registered in
`.mcp.json` but needs a **session restart + interactive OAuth** before migrations may be applied.
**Never apply to `ffurvyqfkaeiwxvjmfan`.** Until authenticated, migrations live on disk only.

---

## 7. PDF — Thai handling (react-pdf) ⚠️ key risk

Requirement: use react-pdf, **beware Thai last-character clipping on wrapped lines**.
`@react-pdf/renderer` cannot break Thai (no inter-word spaces) and clips the final glyph of a
wrapped line. Mitigation implemented in `lib/pdf/thai.ts`:
1. Register a Thai-complete font (**Sarabun** — official Thai gov't font, open license; matches the report's formal look).
2. `Font.registerHyphenationCallback(w => [w])` — never hyphenate.
3. Insert **U+200B (ZWSP)** at word boundaries with `Intl.Segmenter('th',{granularity:'word'})` so lines wrap at real word breaks instead of clipping.
4. Guard: append a hair space to text cells; set line-height ≥ 1.6.

Two documents (A4):
- **Official per-task report** — `รายงานการปฏิบัติงานปรับปรุง/ซ่อมแซม/บำรุงรักษาอาคารสถานที่`: header, ผู้ปฏิบัติงาน / ผู้แจ้ง / สถานที่ / ลักษณะงาน / วัสดุ / ระยะเวลา / **วันที่รับมอบหมาย**, result checkboxes, before+after images, **3-level signature block** (หัวหน้ากลุ่มบริหารทั่วไป → รองผอ. → ผอ.).
- **Per-person period summary** — `สรุปผลการปฏิบัติงานนักการภารโรง`, selectable **รายวัน/สัปดาห์/เดือน/ปี**, stat tiles, task table, 2 signatures.

Signatory names (from mockup, keep configurable in a constants file):
ผู้จัดทำ นางสาวกัลยา งามเลิศ · ผู้ควบคุม นายชนินทร์ยศ มั่นหมาย · หัวหน้ากลุ่มบริหารทั่วไป นายศึกษา จุนเสริม ·
รองผอ. นางสาวกัลยกร จันทร์ดาอ่อน · ผอ. นางสาวทองใบ ตลับทอง.

---

## 8. Image upload

`lib/image/compress.ts` with `browser-image-compression`: max ~1600px, ~0.7 quality, output
**WebP**, before upload to `task-photos`. Show thumbnail previews; support **many** photos per
before/after set (requirement). Strip EXIF.

## 9. Notifications

- **In-app**: `notifications` table + Realtime subscription → bell badge + list; mark-as-read.
- **Web Push**: register SW push, store subscription in `push_subscriptions`. Send from a Next
  Route Handler (or Supabase Edge Function) using `web-push` + VAPID keys (env). Triggers:
  task assigned → janitor; report submitted → admins; approved/sent-back → janitor.
- VAPID keys generated once; stored in Vercel + Supabase env. Never committed.

## 10. PWA

`@serwist/next`: `app/manifest.ts` (name, icons from `ref/logo.png`, theme `#0F766E`,
`display standalone`), service worker precaches the app shell, offline fallback, install prompt
via `useInstallPrompt`. Icons generated at 192/512/maskable.

---

## 11. Folder structure

```
app/
  (auth)/login/                     # sign-in
  (app)/
    layout.tsx                      # header + sidenav/bottomnav + query provider
    page.tsx                        # role-aware landing (admin→dashboard, janitor→board)
    dashboard/ (overview, by-person)
    janitor/  (board, report, stats)
    admin/    (tasks, assign, staff, approve, reports)
  api/push/{subscribe,send}/route.ts
  manifest.ts  layout.tsx  globals.css
components/  ui/ layout/ tasks/ dashboard/ report/ admin/ pdf/
lib/  supabase/{client,server,middleware}.ts  pdf/  image/  push/  queries/
      constants.ts  database.types.ts  utils.ts
hooks/  supabase/migrations/  public/icons/  CLAUDE.md
```

---

## 12. Build phases (task list)

- [x] **P0 Setup** — Next.js 15 + React 19 + TS + Tailwind v3, deps, tokens, base UI, supabase clients, env template.
- [~] **P1 Schema** — migration SQL + demo seed **written** (`supabase/migrations/`, `scripts/seed.mjs`); hand types compile. **APPLY pending** on authenticated MCP → `fobturaedgcxangbaxdh` (see `ACTIVATION.md`).
- [x] **P2 Auth & shell** — username→synthetic-email login, middleware gate, profile bootstrap, role routing, header + sidenav + **mobile bottom nav**, admin route guard.
- [x] **P3 Admin** — assign form (+reporter, +assign date/time), all-tasks table w/ filters, staff CRUD (service-role route), approve queue w/ photo inspect + approve/send-back.
- [x] **P4 Janitor** — board (kanban, mine/all toggle, advance), report form (multi before/after photos + WebP compression), personal stats + category bars.
- [x] **P5 Dashboard** — KPI cards, status bar, waiting-approval, recent tasks, per-person cards.
- [x] **P6 PDF** — Sarabun + `Intl.Segmenter` hyphenation (Thai last-glyph clip fix), per-task official report, per-person period summary.
- [x] **P7 Notifications** — in-app bell + realtime; Web Push subscribe + `/api/notify` send with assign/report/approve/send-back triggers.
- [x] **P8 PWA** — manifest, service worker (push + offline), icons, install prompt.
- [x] **P9 Polish & ship** — `tsc` clean, `next build` **green** (17 routes); security/code review; demo seed; `ACTIVATION.md`. Deploy pending env + MCP apply.

## 13. Conventions
- Small files (<800 lines), immutable updates, explicit error handling, no `console.log` in prod.
- Toasts not alerts; modals for confirm/ask; icons not emoji.
- Typecheck + build **green before every commit**. Conventional commits. No attribution footer.
- Thai copy everywhere in UI; keep signatory/school names in `lib/constants.ts`.
