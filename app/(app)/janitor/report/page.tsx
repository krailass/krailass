import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { ReportForm } from '@/components/janitor/ReportForm';

export default function ReportPage() {
  return (
    <>
      <PageHeader sub="ผู้ปฏิบัติงาน" title="ส่งรายงานการปฏิบัติงาน" />
      <Suspense fallback={null}>
        <ReportForm />
      </Suspense>
    </>
  );
}
