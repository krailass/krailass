'use client';

import * as React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { registerThaiFonts } from '@/lib/pdf/thai';

registerThaiFonts();

// A single trailing space stops @react-pdf from clipping the final Thai glyph
// (e.g. "ดำเนินการ" rendering as "ดำเนินกา"). Same technique as KPServiceProV2's
// thaiSafe(). Paired with the (word) => [word] hyphenation callback.
const PAD = ' ';

// Text wrapper: appends the buffer to EVERY line so no last glyph is clipped.
function T({ children, style }: { children: React.ReactNode; style?: object | object[] }) {
  return (
    <Text style={style as never}>
      {children}
      {PAD}
    </Text>
  );
}

const MAX_IMG = 4; // cap images per set so the report stays on one A4 page

const s = StyleSheet.create({
  page: { fontFamily: 'Sarabun', fontSize: 11, lineHeight: 1.55, color: '#1a1a1a', padding: 36, paddingBottom: 34 },
  center: { textAlign: 'center' },
  h1: { fontSize: 14, fontWeight: 700, textAlign: 'center' },
  h2: { fontSize: 11.5, fontWeight: 600, textAlign: 'center', marginTop: 2 },
  line: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  row: { flexDirection: 'row' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  field: { fontSize: 11, marginTop: 4 },
  bold: { fontWeight: 700 },
  sectionTitle: { fontSize: 11, fontWeight: 600, marginTop: 10, marginBottom: 3 },
  imgRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  img: { width: 116, height: 84, objectFit: 'cover', borderRadius: 3, border: '1 solid #ddd' },
  imgEmpty: { fontSize: 10, color: '#888', marginTop: 2 },
  checkbox: { width: 13, height: 13, border: '1 solid #333', textAlign: 'center', fontSize: 10, marginRight: 5 },
  signGrid: { flexDirection: 'row', gap: 16, marginTop: 18 },
  signCol: { flex: 1, fontSize: 10.5 },
  sign: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 6 },
  signBlank: { alignItems: 'center' },
  approveTitle: { fontSize: 10.5, fontWeight: 700, marginTop: 12 },
  dots: { marginTop: 9, height: 9, borderBottomWidth: 1, borderBottomColor: '#666', borderStyle: 'dashed' },
  directorBlock: { marginTop: 14, alignItems: 'center' },
  // summary
  tiles: { flexDirection: 'row', gap: 5, marginVertical: 10 },
  tile: { flex: 1, border: '1 solid #e2e2e2', borderRadius: 5, padding: 5, textAlign: 'center' },
  tileNum: { fontSize: 16, fontWeight: 700 },
  tileLabel: { fontSize: 8.5, color: '#666' },
  table: { marginTop: 3, border: '1 solid #ddd' },
  th: { flexDirection: 'row', backgroundColor: '#f3f5f1' },
  tr: { flexDirection: 'row', borderTop: '1 solid #ddd' },
  cellNo: { width: 26, padding: 3, fontSize: 9.5, textAlign: 'center', borderRight: '1 solid #ddd' },
  cellTitle: { flex: 1, padding: 3, fontSize: 9.5, borderRight: '1 solid #ddd' },
  cellCat: { width: 84, padding: 3, fontSize: 9.5, textAlign: 'center', borderRight: '1 solid #ddd' },
  cellDate: { width: 68, padding: 3, fontSize: 9.5, textAlign: 'center', borderRight: '1 solid #ddd' },
  cellStatus: { width: 78, padding: 3, fontSize: 9.5, textAlign: 'center' },
  thText: { fontWeight: 700 },
});

export interface Signatories {
  preparer: string;
  operator: string;
  generalAffairsHead: string;
  deputyDirector: string;
  director: string;
}

export interface TaskReportDocProps {
  school: string;
  dept: string;
  dateText: string;
  assigneeName: string;
  reporter: string;
  location: string;
  title: string;
  materials: string;
  timeStart: string;
  timeEnd: string;
  assignDateText: string;
  assignTimeText: string;
  statusDone: boolean;
  statusProgress: boolean;
  beforeImgs: string[];
  afterImgs: string[];
  signatories: Signatories;
}

// A signature: "ลงชื่อ ......(blank)...... [role]" with the (name) centered
// directly under the dotted blank. justifyContent centers the whole unit within
// its parent — so it centers in a column, or across the page for the director.
function Sign({ role, name }: { role: string; name: string }) {
  return (
    <View style={s.sign}>
      <T>ลงชื่อ</T>
      <View style={s.signBlank}>
        <T>...............................</T>
        <T>({name})</T>
      </View>
      <T>{' ' + role}</T>
    </View>
  );
}

function ImgGrid({ imgs, empty }: { imgs: string[]; empty: string }) {
  const shown = imgs.slice(0, MAX_IMG);
  if (shown.length === 0) return <T style={s.imgEmpty}>{empty}</T>;
  return (
    <View style={s.imgRow}>
      {shown.map((src, i) => (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image key={i} src={src} style={s.img} />
      ))}
    </View>
  );
}

function TaskReportPage(p: TaskReportDocProps) {
  return (
      <Page size="A4" style={s.page}>
        <View style={s.center}>
          <T style={s.h1}>รายงานการปฏิบัติงานปรับปรุง/ซ่อมแซม/บำรุงรักษาอาคารสถานที่</T>
          <T style={s.h2}>
            {p.school} {p.dept}
          </T>
          <T style={s.line}>{p.dateText}</T>
        </View>

        <T style={s.field}>
          ชื่อผู้ปฏิบัติงาน <Text style={s.bold}>{p.assigneeName || '—'}</Text>
        </T>
        <T style={s.field}>
          ผู้แจ้ง/ผู้ขอรับบริการ <Text style={s.bold}>{p.reporter || '—'}</Text>
        </T>
        <T style={s.field}>
          สถานที่ปฏิบัติงาน <Text style={s.bold}>{p.location || '—'}</Text>
        </T>
        <T style={s.field}>ลักษณะงาน {p.title || '—'}</T>
        <T style={s.field}>วัสดุอุปกรณ์ที่ใช้ {p.materials || '—'}</T>
        <T style={s.field}>
          ระยะเวลาปฏิบัติงาน เริ่มเวลา <Text style={s.bold}>{p.timeStart || '.........'}</Text> น. สิ้นสุดเวลา{' '}
          <Text style={s.bold}>{p.timeEnd || '.........'}</Text> น.
        </T>
        <T style={s.field}>
          วันที่รับมอบหมายงาน <Text style={s.bold}>{p.assignDateText || '—'}</Text> เวลา{' '}
          <Text style={s.bold}>{p.assignTimeText || '—'}</Text> น.
        </T>

        <View style={[s.row, { marginTop: 5, gap: 18 }]}>
          <T>ผลการดำเนินงาน</T>
          <View style={s.row}>
            <Text style={s.checkbox}>{p.statusDone ? '✓' : ' '}</Text>
            <T>ดำเนินการแล้วเสร็จ</T>
          </View>
          <View style={s.row}>
            <Text style={s.checkbox}>{p.statusProgress ? '✓' : ' '}</Text>
            <T>อยู่ระหว่างดำเนินการ</T>
          </View>
        </View>

        <T style={s.sectionTitle}>รูปภาพก่อนดำเนินการ</T>
        <ImgGrid imgs={p.beforeImgs} empty="— ไม่มีรูปภาพ —" />
        <T style={s.sectionTitle}>รูปภาพหลังดำเนินการ</T>
        <ImgGrid imgs={p.afterImgs} empty="— ไม่มีรูปภาพ —" />

        <View style={s.signGrid}>
          {/* Left column: preparer + general-affairs head */}
          <View style={s.signCol}>
            <Sign role="ผู้จัดทำข้อมูล" name={p.signatories.preparer} />
            <T style={s.approveTitle}>ความเห็นของหัวหน้ากลุ่มบริหารทั่วไป</T>
            <View style={s.dots} />
            <Sign role="หัวหน้ากลุ่มบริหารทั่วไป" name={p.signatories.generalAffairsHead} />
          </View>

          {/* Right column: operator + deputy */}
          <View style={s.signCol}>
            <Sign role="ผู้ควบคุมและดำเนินงาน" name={p.signatories.operator} />
            <T style={s.approveTitle}>ความเห็นของรองผู้อำนวยการโรงเรียน</T>
            <View style={s.dots} />
            <Sign role="รองผู้อำนวยการโรงเรียน" name={p.signatories.deputyDirector} />
          </View>
        </View>

        {/* Director — centered across the whole page */}
        <View style={s.directorBlock}>
          <T style={[s.approveTitle, s.center]}>ความเห็นของผู้อำนวยการโรงเรียน</T>
          <View style={[s.dots, { width: '55%' }]} />
          <Sign role="ผู้อำนวยการโรงเรียน" name={p.signatories.director} />
        </View>
      </Page>
  );
}

// One official report per task, on its own A4 page.
export function TaskReportDocument(p: TaskReportDocProps) {
  return (
    <Document>
      <TaskReportPage {...p} />
    </Document>
  );
}

// Batch: several tasks' official reports in one PDF (one page each), for
// printing a person's work over a selected period in a single file.
export function BatchTaskReportDocument({ items }: { items: TaskReportDocProps[] }) {
  return (
    <Document>
      {items.map((it, i) => (
        <TaskReportPage key={i} {...it} />
      ))}
    </Document>
  );
}

export interface SummaryRow {
  no: number;
  title: string;
  category: string;
  dateText: string;
  statusLabel: string;
}

export interface PersonSummaryDocProps {
  school: string;
  dept: string;
  name: string;
  zone: string;
  periodLabel: string;
  rangeText: string;
  stats: { total: number; done: number; progress: number; pending: number; pct: number };
  rows: SummaryRow[];
  signatories: Signatories;
}

export function PersonSummaryDocument(p: PersonSummaryDocProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.center}>
          <T style={s.h1}>สรุปผลการปฏิบัติงานนักการภารโรง</T>
          <T style={s.h2}>
            {p.school} {p.dept}
          </T>
          <T style={s.line}>
            รายงาน{p.periodLabel} · {p.rangeText}
          </T>
        </View>

        <View style={[s.between, { borderBottom: '1 solid #ddd', paddingBottom: 6, marginTop: 6 }]}>
          <T style={s.field}>
            ชื่อผู้ปฏิบัติงาน <Text style={s.bold}>{p.name}</Text>
          </T>
          <T style={s.field}>
            หน้าที่ / เขต <Text style={s.bold}>{p.zone || '—'}</Text>
          </T>
        </View>

        <View style={s.tiles}>
          <Tile n={p.stats.total} label="งานทั้งหมด" />
          <Tile n={p.stats.done} label="เสร็จ" color="#0F7A45" />
          <Tile n={p.stats.progress} label="กำลังทำ" color="#B45309" />
          <Tile n={p.stats.pending} label="ค้าง" color="#5A6772" />
          <Tile n={`${p.stats.pct}%`} label="สำเร็จ" color="#0F766E" />
        </View>

        <T style={{ fontWeight: 600, marginBottom: 3, fontSize: 10.5 }}>รายการงานในช่วงเวลานี้</T>
        <View style={s.table}>
          <View style={s.th}>
            <T style={[s.cellNo, s.thText]}>ที่</T>
            <T style={[s.cellTitle, s.thText]}>ลักษณะงาน</T>
            <T style={[s.cellCat, s.thText]}>ประเภท</T>
            <T style={[s.cellDate, s.thText]}>วันที่</T>
            <T style={[s.cellStatus, s.thText]}>สถานะ</T>
          </View>
          {p.rows.length === 0 && (
            <View style={s.tr}>
              <T style={[s.cellTitle, { textAlign: 'center' }]}>— ไม่มีรายการในช่วงเวลานี้ —</T>
            </View>
          )}
          {p.rows.map((r) => (
            <View key={r.no} style={s.tr} wrap={false}>
              <Text style={s.cellNo}>{r.no}</Text>
              <T style={s.cellTitle}>{r.title}</T>
              <T style={s.cellCat}>{r.category || '—'}</T>
              <T style={s.cellDate}>{r.dateText}</T>
              <T style={s.cellStatus}>{r.statusLabel}</T>
            </View>
          ))}
        </View>

        <View style={s.signGrid}>
          <View style={s.signCol}>
            <T>ลงชื่อ ...............................................</T>
            <T>({p.name})</T>
            <T>นักการภารโรง</T>
          </View>
          <View style={s.signCol}>
            <T>ลงชื่อ ...............................................</T>
            <T>({p.signatories.generalAffairsHead})</T>
            <T>หัวหน้ากลุ่มงานบริหารทั่วไป</T>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function Tile({ n, label, color }: { n: number | string; label: string; color?: string }) {
  return (
    <View style={s.tile}>
      <Text style={[s.tileNum, color ? { color } : {}]}>{n}</Text>
      <T style={s.tileLabel}>{label}</T>
    </View>
  );
}
