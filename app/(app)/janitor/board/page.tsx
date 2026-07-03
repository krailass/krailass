import { PageHeader } from '@/components/layout/AppShell';
import { Board } from '@/components/janitor/Board';

export default function BoardPage() {
  return (
    <>
      <PageHeader sub="ผู้ปฏิบัติงาน" title="งานของฉัน" />
      <Board />
    </>
  );
}
