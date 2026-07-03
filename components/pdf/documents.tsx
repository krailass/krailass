'use client';

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { registerThaiFonts } from '@/lib/pdf/thai';

registerThaiFonts();

const s = StyleSheet.create({
  page: { fontFamily: 'Sarabun', fontSize: 11, lineHeight: 1.7, color: '#1a1a1a', padding: 36, paddingBottom: 48 },
  center: { textAlign: 'center' },
  h1: { fontSize: 15, fontWeight: 700, textAlign: 'center' },
  h2: { fontSize: 13, fontWeight: 600, textAlign: 'center' },
  line: { fontSize: 12, marginTop: 3 },
  row: { flexDirection: 'row' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  field: { fontSize: 12, marginTop: 3 },
  bold: { fontWeight: 700 },
  underline: { textDecoration: 'underline' },
  sectionTitle: { fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 4 },
  imgRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  img: { width: 150, height: 112, objectFit: 'cover', borderRadius: 4, border: '1 solid #ddd' },
  imgEmpty: { fontSize: 10, color: '#888', marginTop: 2 },
  checkbox: { width: 14, height: 14, border: '1.2 solid #333', textAlign: 'center', fontSize: 10, marginRight: 5 },
  signGrid: { flexDirection: 'row', gap: 12, marginTop: 28, textAlign: 'center' },
  signCol: { flex: 1, textAlign: 'center', fontSize: 11 },
  // summary
  tiles: { flexDirection: 'row', gap: 6, marginVertical: 14 },
  tile: { flex: 1, border: '1 solid #e2e2e2', borderRadius: 6, padding: 6, textAlign: 'center' },
  tileNum: { fontSize: 18, fontWeight: 700 },
  tileLabel: { fontSize: 9, color: '#666' },
  table: { marginTop: 4, border: '1 solid #ddd' },
  th: { flexDirection: 'row', backgroundColor: '#f3f5f1' },
  tr: { flexDirection: 'row', borderTop: '1 solid #ddd' },
  cellNo: { width: 30, padding: 4, fontSize: 10.5, textAlign: 'center', borderRight: '1 solid #ddd' },
  cellTitle: { flex: 1, padding: 4, fontSize: 10.5, borderRight: '1 solid #ddd' },
  cellCat: { width: 90, padding: 4, fontSize: 10.5, textAlign: 'center', borderRight: '1 solid #ddd' },
  cellDate: { width: 74, padding: 4, fontSize: 10.5, textAlign: 'center', borderRight: '1 solid #ddd' },
  cellStatus: { width: 84, padding: 4, fontSize: 10.5, textAlign: 'center' },
  thText: { fontWeight: 700 },
  comment: { fontSize: 12, marginTop: 10 },
  signRight: { textAlign: 'right', marginTop: 6, fontSize: 12 },
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

function ImgGrid({ imgs, empty }: { imgs: string[]; empty: string }) {
  if (imgs.length === 0) return <Text style={s.imgEmpty}>{empty}</Text>;
  return (
    <View style={s.imgRow}>
      {imgs.map((src, i) => (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image key={i} src={src} style={s.img} />
      ))}
    </View>
  );
}

export function TaskReportDocument(p: TaskReportDocProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.center}>
          <Text style={s.h1}>รายงานการปฏิบัติงานปรับปรุง/ซ่อมแซม/บำรุงรักษาอาคารสถานที่</Text>
          <Text style={s.h2}>
            {p.school} {p.dept}
          </Text>
          <Text style={s.line}>{p.dateText}</Text>
        </View>

        <Text style={s.field}>
          ชื่อผู้ปฏิบัติงาน <Text style={s.bold}>{p.assigneeName || '—'}</Text>
        </Text>
        <Text style={s.field}>
          ผู้แจ้ง/ผู้ขอรับบริการ <Text style={s.bold}>{p.reporter || '—'}</Text>
        </Text>
        <Text style={s.field}>
          สถานที่ปฏิบัติงาน <Text style={s.bold}>{p.location || '—'}</Text>
        </Text>
        <Text style={s.field}>ลักษณะงาน {p.title || '—'}</Text>
        <Text style={s.field}>วัสดุอุปกรณ์ที่ใช้ {p.materials || '—'}</Text>
        <Text style={s.field}>
          ระยะเวลาปฏิบัติงาน เริ่มเวลา <Text style={s.bold}>{p.timeStart || '.........'}</Text> น. สิ้นสุดเวลา{' '}
          <Text style={s.bold}>{p.timeEnd || '.........'}</Text> น.
        </Text>
        <Text style={s.field}>
          วันที่รับมอบหมายงาน <Text style={s.bold}>{p.assignDateText || '—'}</Text> เวลา{' '}
          <Text style={s.bold}>{p.assignTimeText || '—'}</Text> น.
        </Text>

        <View style={[s.row, { marginTop: 6, gap: 20 }]}>
          <Text>ผลการดำเนินงาน</Text>
          <View style={s.row}>
            <Text style={s.checkbox}>{p.statusDone ? '✓' : ' '}</Text>
            <Text>ดำเนินการแล้วเสร็จ</Text>
          </View>
          <View style={s.row}>
            <Text style={s.checkbox}>{p.statusProgress ? '✓' : ' '}</Text>
            <Text>อยู่ระหว่างดำเนินการ</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>รูปภาพก่อนดำเนินการ</Text>
        <ImgGrid imgs={p.beforeImgs} empty="— ไม่มีรูปภาพ —" />
        <Text style={s.sectionTitle}>รูปภาพหลังดำเนินการ</Text>
        <ImgGrid imgs={p.afterImgs} empty="— ไม่มีรูปภาพ —" />

        <View style={s.signGrid}>
          <View style={s.signCol}>
            <Text>ลงชื่อ ...............................................</Text>
            <Text>({p.signatories.preparer})</Text>
            <Text>ผู้จัดทำข้อมูล</Text>
          </View>
          <View style={s.signCol}>
            <Text>ลงชื่อ ...............................................</Text>
            <Text>({p.signatories.operator})</Text>
            <Text>ผู้ควบคุมและดำเนินงาน</Text>
          </View>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={s.comment}>ความเห็นของหัวหน้ากลุ่มบริหารทั่วไป ..............................................................</Text>
          <Text style={s.signRight}>ลงชื่อ ............................. หัวหน้ากลุ่มบริหารทั่วไป</Text>
          <Text style={[s.signRight, { marginTop: 0 }]}>({p.signatories.generalAffairsHead})</Text>

          <Text style={s.comment}>ความเห็นของรองผู้อำนวยการโรงเรียน ..............................................................</Text>
          <Text style={s.signRight}>ลงชื่อ ............................. รองผู้อำนวยการโรงเรียน</Text>
          <Text style={[s.signRight, { marginTop: 0 }]}>({p.signatories.deputyDirector})</Text>

          <Text style={s.comment}>ความเห็นของผู้อำนวยการโรงเรียน ..............................................................</Text>
          <Text style={s.signRight}>ลงชื่อ ............................. ผู้อำนวยการโรงเรียน</Text>
          <Text style={[s.signRight, { marginTop: 0 }]}>({p.signatories.director})</Text>
        </View>
      </Page>
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
          <Text style={s.h1}>สรุปผลการปฏิบัติงานนักการภารโรง</Text>
          <Text style={s.h2}>
            {p.school} {p.dept}
          </Text>
          <Text style={s.line}>
            รายงาน{p.periodLabel} · {p.rangeText}
          </Text>
        </View>

        <View style={[s.between, { borderBottom: '1 solid #ddd', paddingBottom: 8, marginTop: 8 }]}>
          <Text style={s.field}>
            ชื่อผู้ปฏิบัติงาน <Text style={s.bold}>{p.name}</Text>
          </Text>
          <Text style={s.field}>
            หน้าที่ / เขต <Text style={s.bold}>{p.zone || '—'}</Text>
          </Text>
        </View>

        <View style={s.tiles}>
          <Tile n={p.stats.total} label="งานทั้งหมด" />
          <Tile n={p.stats.done} label="เสร็จ" color="#0F7A45" />
          <Tile n={p.stats.progress} label="กำลังทำ" color="#B45309" />
          <Tile n={p.stats.pending} label="ค้าง" color="#5A6772" />
          <Tile n={`${p.stats.pct}%`} label="สำเร็จ" color="#0F766E" />
        </View>

        <Text style={{ fontWeight: 600, marginBottom: 4 }}>รายการงานในช่วงเวลานี้</Text>
        <View style={s.table}>
          <View style={s.th}>
            <Text style={[s.cellNo, s.thText]}>ที่</Text>
            <Text style={[s.cellTitle, s.thText]}>ลักษณะงาน</Text>
            <Text style={[s.cellCat, s.thText]}>ประเภท</Text>
            <Text style={[s.cellDate, s.thText]}>วันที่</Text>
            <Text style={[s.cellStatus, s.thText]}>สถานะ</Text>
          </View>
          {p.rows.length === 0 && (
            <View style={s.tr}>
              <Text style={[s.cellTitle, { textAlign: 'center' }]}>— ไม่มีรายการในช่วงเวลานี้ —</Text>
            </View>
          )}
          {p.rows.map((r) => (
            <View key={r.no} style={s.tr} wrap={false}>
              <Text style={s.cellNo}>{r.no}</Text>
              <Text style={s.cellTitle}>{r.title}</Text>
              <Text style={s.cellCat}>{r.category || '—'}</Text>
              <Text style={s.cellDate}>{r.dateText}</Text>
              <Text style={s.cellStatus}>{r.statusLabel}</Text>
            </View>
          ))}
        </View>

        <View style={s.signGrid}>
          <View style={s.signCol}>
            <Text>ลงชื่อ ...............................................</Text>
            <Text>({p.name})</Text>
            <Text>นักการภารโรง</Text>
          </View>
          <View style={s.signCol}>
            <Text>ลงชื่อ ...............................................</Text>
            <Text>({p.signatories.generalAffairsHead})</Text>
            <Text>หัวหน้ากลุ่มงานบริหารทั่วไป</Text>
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
      <Text style={s.tileLabel}>{label}</Text>
    </View>
  );
}
