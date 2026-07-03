import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { AssignForm } from '@/components/admin/AssignForm';

export default function AssignPage() {
  return (
    <>
      <PageHeader sub="กลุ่มบริหารทั่วไป" title="มอบหมายงานใหม่" />
      <Suspense fallback={null}>
        <AssignForm />
      </Suspense>
    </>
  );
}
