import { PageHeader } from '@/components/layout/AppShell';
import { StaffManager } from '@/components/admin/StaffManager';

export default function StaffPage() {
  return (
    <>
      <PageHeader sub="กลุ่มบริหารทั่วไป" title="จัดการนักการภารโรง" />
      <StaffManager />
    </>
  );
}
