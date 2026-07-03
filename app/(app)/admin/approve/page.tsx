import { PageHeader } from '@/components/layout/AppShell';
import { ApproveQueue } from '@/components/admin/ApproveQueue';

export default function ApprovePage() {
  return (
    <>
      <PageHeader sub="กลุ่มบริหารทั่วไป" title="ตรวจและอนุมัติงาน" />
      <ApproveQueue />
    </>
  );
}
