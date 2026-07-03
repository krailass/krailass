import { PageHeader } from '@/components/layout/AppShell';
import { Profile } from '@/components/janitor/Profile';

export default function ProfilePage() {
  return (
    <>
      <PageHeader sub="ผู้ปฏิบัติงาน" title="ข้อมูลส่วนตัว" />
      <Profile />
    </>
  );
}
