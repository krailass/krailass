// Demo seed: 1 admin + 6 janitors + 14 tasks (mirrors the reference mockup).
// Run AFTER applying migrations, with env set:
//   node --env-file=.env.local scripts/seed.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const domain = process.env.NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN || 'sawai.local';
const PASSWORD = process.env.SEED_PASSWORD || 'sawai1234';

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
const email = (u) => `${u}@${domain}`;

const ADMIN = { username: 'admin', full_name: 'นายศึกษา จุนเสริม', role: 'admin', zone: 'กลุ่มบริหารทั่วไป', phone: '' };

const JANITORS = [
  { username: 'chanin', full_name: 'นายชนินทร์ยศ มั่นหมาย', zone: 'เขตอาคาร 1–2', phone: '081-234-5678' },
  { username: 'somchai', full_name: 'นายสมชาย ใจดี', zone: 'เขตอาคาร 3', phone: '082-345-6789' },
  { username: 'boonmee', full_name: 'นายบุญมี ทองคำ', zone: 'โรงอาหาร / หอประชุม', phone: '083-456-7890' },
  { username: 'sunee', full_name: 'นางสุนีย์ พุ่มพวง', zone: 'ทำความสะอาดอาคารเรียน', phone: '084-567-8901' },
  { username: 'wirat', full_name: 'นายวิรัตน์ แก้วมณี', zone: 'งานไฟฟ้า–ประปา', phone: '085-678-9012' },
  { username: 'prasong', full_name: 'นายประสงค์ ศรีสุข', zone: 'ภูมิทัศน์ / สวน', phone: '086-789-0123' },
];

const TASKS = [
  ['ซ่อมประตูห้องเรียน 214 ปิดไม่สนิท', 'ครูสมหญิง ใจงาม', 'อาคาร 2', 'ซ่อมแซม', 'นายชนินทร์ยศ มั่นหมาย', 'progress', null, 'urgent', '30 มิ.ย. 69', '2026-06-30', '2026-06-28', '09:00', 'บานพับ, สกรู, ไขควง', '', '', ''],
  ['เปลี่ยนหลอดไฟทางเดินชั้น 3', 'ครูเวรอาคาร 1', 'อาคาร 1 (เรียนรวม)', 'ไฟฟ้า-ประปา', 'นายวิรัตน์ แก้วมณี', 'pending', null, 'normal', '2 ก.ค. 69', '2026-07-02', '2026-07-01', '08:30', '', '', '', ''],
  ['ตัดแต่งต้นไม้และพุ่มไม้หน้าเสาธง', 'ฝ่ายอาคารสถานที่', 'สวนหย่อมหน้าเสาธง', 'ดูแลภูมิทัศน์', 'นายประสงค์ ศรีสุข', 'done', 'approved', 'normal', '28 มิ.ย. 69', '2026-06-28', '2026-06-27', '08:00', 'กรรไกรตัดกิ่ง, เลื่อย', '08:30', '11:00', 'ตัดแต่งเรียบร้อย เก็บกวาดพื้นที่แล้ว'],
  ['ทำความสะอาดห้องน้ำหญิง อาคาร 2', 'ครูอนามัย', 'อาคาร 2', 'ทำความสะอาด', 'นางสุนีย์ พุ่มพวง', 'done', 'waiting', 'normal', '30 มิ.ย. 69', '2026-06-30', '2026-06-30', '12:30', 'น้ำยาทำความสะอาด, แปรง', '13:00', '14:30', 'ล้างพื้นและสุขภัณฑ์ครบทุกห้อง'],
  ['ซ่อมโต๊ะม้าหินอ่อนในโรงอาหาร', 'แม่ครัวโรงอาหาร', 'โรงอาหาร', 'ซ่อมแซม', 'นายบุญมี ทองคำ', 'progress', null, 'normal', '3 ก.ค. 69', '2026-07-03', '2026-07-02', '10:00', 'ปูนซีเมนต์, ทราย', '', '', ''],
  ['ทาสีราวบันไดอาคาร 3 ใหม่', 'ครูประจำอาคาร 3', 'อาคาร 3', 'ปรับปรุง', 'นายสมชาย ใจดี', 'pending', null, 'normal', '5 ก.ค. 69', '2026-07-05', '2026-07-03', '09:30', '', '', '', ''],
  ['ซ่อมก๊อกน้ำห้องปฏิบัติการวิทยาศาสตร์', 'ครูวิทยาศาสตร์', 'ห้องปฏิบัติการวิทยาศาสตร์', 'ไฟฟ้า-ประปา', 'นายวิรัตน์ แก้วมณี', 'progress', null, 'urgent', '1 ก.ค. 69', '2026-07-01', '2026-06-30', '13:00', 'ก๊อกน้ำใหม่, เทปพันเกลียว', '', '', ''],
  ['เก็บขยะและกวาดใบไม้รอบสนามกีฬา', 'ครูพลศึกษา', 'สนามกีฬา', 'ทำความสะอาด', 'นายประสงค์ ศรีสุข', 'done', 'approved', 'normal', '27 มิ.ย. 69', '2026-06-27', '2026-06-26', '07:00', 'ไม้กวาด, ถุงขยะ', '07:00', '09:00', 'เก็บขยะครบพื้นที่'],
  ['ซ่อมพัดลมเพดานหอประชุม 2 ตัว', 'ครูดนตรี', 'หอประชุม', 'ซ่อมแซม', 'นายบุญมี ทองคำ', 'pending', null, 'urgent', '1 ก.ค. 69', '2026-07-01', '2026-06-30', '15:00', '', '', '', ''],
  ['บำรุงรักษาเครื่องปรับอากาศห้องธุรการ', 'เจ้าหน้าที่ธุรการ', 'ห้องธุรการ', 'บำรุงรักษา', 'นายวิรัตน์ แก้วมณี', 'pending', null, 'normal', '6 ก.ค. 69', '2026-07-06', '2026-07-04', '09:00', '', '', '', ''],
  ['ปรับปรุงป้ายชื่อโรงเรียนหน้าประตู', 'ฝ่ายประชาสัมพันธ์', 'ลานจอดรถ', 'ปรับปรุง', 'นายสมชาย ใจดี', 'progress', null, 'normal', '4 ก.ค. 69', '2026-07-04', '2026-07-02', '10:30', 'สีสเปรย์, แปรงทาสี', '', '', ''],
  ['ทำความสะอาดกระจกอาคารเรียนรวม', 'ครูเวรอาคารเรียนรวม', 'อาคาร 1 (เรียนรวม)', 'ทำความสะอาด', 'นางสุนีย์ พุ่มพวง', 'pending', null, 'normal', '7 ก.ค. 69', '2026-07-07', '2026-07-05', '08:00', '', '', '', ''],
  ['ซ่อมบานพับหน้าต่างห้อง 315', 'ครูประจำห้อง 315', 'อาคาร 3', 'ซ่อมแซม', 'นายชนินทร์ยศ มั่นหมาย', 'done', 'waiting', 'normal', '29 มิ.ย. 69', '2026-06-29', '2026-06-28', '09:00', 'บานพับ, สกรู', '09:15', '10:00', 'เปลี่ยนบานพับใหม่ 2 จุด'],
  ['ดูแลและรดน้ำสนามหญ้าหน้าอาคาร 1', 'ฝ่ายอาคารสถานที่', 'อาคาร 1 (เรียนรวม)', 'ดูแลภูมิทัศน์', 'นายประสงค์ ศรีสุข', 'progress', null, 'normal', 'ทุกวัน', '2026-06-30', '2026-06-30', '06:30', 'สายยาง, ปุ๋ย', '', '', ''],
];

async function ensureUser(u, role) {
  const { data, error } = await sb.auth.admin.createUser({
    email: email(u.username),
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.full_name, prefix: '', role, zone: u.zone, phone: u.phone },
  });
  if (error && !/registered|exists/i.test(error.message)) {
    throw new Error(`createUser ${u.username}: ${error.message}`);
  }
  if (data?.user) console.log(`  + ${u.username} (${u.full_name})`);
  else console.log(`  = ${u.username} already exists`);
}

async function main() {
  console.log('Seeding accounts…');
  await ensureUser(ADMIN, 'admin');
  for (const j of JANITORS) await ensureUser(j, 'janitor');

  // Map full_name -> profile id
  const { data: profiles, error: pErr } = await sb.from('profiles').select('id, full_name');
  if (pErr) throw pErr;
  const idByName = new Map(profiles.map((p) => [p.full_name, p.id]));
  const adminId = idByName.get(ADMIN.full_name) ?? null;

  // The signup trigger creates every account as 'janitor' (no metadata-based
  // escalation). Promote the seed admin explicitly via the service-role client.
  if (adminId) {
    const { error: roleErr } = await sb
      .from('profiles')
      .update({ role: 'admin', zone: ADMIN.zone })
      .eq('id', adminId);
    if (roleErr) throw new Error(`promote admin: ${roleErr.message}`);
  }

  const { count } = await sb.from('tasks').select('id', { count: 'exact', head: true });
  if (count && count > 0) {
    console.log(`Tasks already present (${count}); skipping task seed.`);
    return done();
  }

  console.log('Seeding tasks…');
  const rows = TASKS.map((t) => {
    const [title, reporter, location, category, assignee, status, approval, priority, dueText, dueDate, asgDate, asgTime, materials, ts, te, note] = t;
    return {
      title,
      reporter,
      location,
      category,
      assignee_id: idByName.get(assignee) ?? null,
      status,
      approval,
      priority,
      due_text: dueText,
      due_date: dueDate,
      assigned_date: asgDate,
      assigned_time: asgTime,
      materials: materials || null,
      time_start: ts || null,
      time_end: te || null,
      note: note || null,
      completed_at: status === 'done' ? new Date(dueDate).toISOString() : null,
      approved_by: approval === 'approved' ? adminId : null,
      approved_at: approval === 'approved' ? new Date(dueDate).toISOString() : null,
      created_by: adminId,
    };
  });
  const { error: tErr } = await sb.from('tasks').insert(rows);
  if (tErr) throw tErr;
  console.log(`  + ${rows.length} tasks`);
  done();
}

function done() {
  console.log('\nDone. Login credentials:');
  console.log(`  admin  : admin  / ${PASSWORD}`);
  console.log(`  janitor: chanin, somchai, boonmee, sunee, wirat, prasong  / ${PASSWORD}`);
}

main().catch((e) => {
  console.error('\nSeed failed:', e.message);
  process.exit(1);
});
