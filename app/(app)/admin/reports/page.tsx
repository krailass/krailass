import { PageHeader } from '@/components/layout/AppShell';
import { ReportsPicker } from '@/components/admin/ReportsPicker';
import { PersonSummaryReport } from '@/components/admin/PersonSummaryReport';

export default function ReportsPage() {
  return (
    <>
      <PageHeader sub="กลุ่มบริหารทั่วไป" title="รายงานการปฏิบัติงาน (PDF)" />
      <div className="mb-5">
        <PersonSummaryReport />
      </div>
      <div className="mb-2 text-[12px] font-semibold tracking-wide text-muted-soft" data-noprint>
        รายงานฉบับทางการ (รายชิ้นงาน)
      </div>
      <ReportsPicker />
    </>
  );
}
