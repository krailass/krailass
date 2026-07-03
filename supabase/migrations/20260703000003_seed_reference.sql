-- ============================================================================
-- Seed reference data: categories (with mockup colors) + locations
-- Idempotent. Safe to re-run.
-- ============================================================================
insert into public.categories (name, color_bg, color_text, sort) values
  ('ซ่อมแซม',        '#EAF0FB', '#2456B8', 1),
  ('บำรุงรักษา',      '#F0EDFB', '#6B45C4', 2),
  ('ปรับปรุง',        '#FBEFEA', '#B85526', 3),
  ('ทำความสะอาด',    '#E7F3F6', '#1E7A8C', 4),
  ('ไฟฟ้า-ประปา',     '#FBF3E1', '#9A6B12', 5),
  ('ดูแลภูมิทัศน์',     '#E9F4E6', '#3B7A2E', 6)
on conflict (name) do update
  set color_bg = excluded.color_bg,
      color_text = excluded.color_text,
      sort = excluded.sort;

insert into public.locations (name, sort) values
  ('อาคาร 1 (เรียนรวม)', 1),
  ('อาคาร 2', 2),
  ('อาคาร 3', 3),
  ('โรงอาหาร', 4),
  ('หอประชุม', 5),
  ('สนามกีฬา', 6),
  ('สวนหย่อมหน้าเสาธง', 7),
  ('ห้องปฏิบัติการวิทยาศาสตร์', 8),
  ('ลานจอดรถ', 9),
  ('ห้องธุรการ', 10)
on conflict (name) do update set sort = excluded.sort;
</content>
