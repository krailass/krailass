import { PageHeader } from '@/components/layout/AppShell';
import { About } from '@/components/admin/About';

export default function AboutPage() {
  return (
    <>
      <PageHeader sub="กลุ่มบริหารทั่วไป" title="เกี่ยวกับระบบ" />
      <About />
    </>
  );
}
