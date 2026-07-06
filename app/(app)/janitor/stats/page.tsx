import { PageHeader } from '@/components/layout/AppShell';
import { Stats } from '@/components/janitor/Stats';

export default function StatsPage() {
  return (
    <>
      <PageHeader sub="ผู้ปฏิบัติงาน" title="สถิติการทำงานของฉัน" />
      <Stats />
    </>
  );
}
