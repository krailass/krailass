import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { ReportForm } from '@/components/janitor/ReportForm';

export default function AdminReportPage() {
  return (
    <>
      <PageHeader sub="กลุ่มบริหารทั่วไป" title="บันทึกผลงานแทนนักการ" />
      <Suspense fallback={null}>
        <ReportForm adminMode />
      </Suspense>
    </>
  );
}
