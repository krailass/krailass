import { PageHeader } from '@/components/layout/AppShell';
import { TasksView } from '@/components/admin/TasksView';
import { JobGroups } from '@/components/admin/JobGroups';

export default function AdminTasksPage() {
  return (
    <>
      <PageHeader sub="กลุ่มบริหารทั่วไป" title="งานทั้งหมด" />
      <JobGroups />
      <TasksView />
    </>
  );
}
