import { PageHeader } from '@/components/layout/AppShell';
import { ByPerson } from '@/components/dashboard/ByPerson';

export default function ByPersonPage() {
  return (
    <>
      <PageHeader sub="ภาพรวมการปฏิบัติงาน" title="งานแยกรายบุคคล" />
      <ByPerson />
    </>
  );
}
