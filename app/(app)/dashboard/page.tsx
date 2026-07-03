import { PageHeader } from '@/components/layout/AppShell';
import { Overview } from '@/components/dashboard/Overview';

export default function DashboardPage() {
  return (
    <>
      <PageHeader sub="ภาพรวมการปฏิบัติงาน" title="ภาพรวมการปฏิบัติงาน" />
      <Overview />
    </>
  );
}
