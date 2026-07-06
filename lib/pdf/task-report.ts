import { fetchTaskPhotos, type SB } from '@/lib/api';
import { urlToDataUrl } from '@/lib/pdf/download';
import { SCHOOL, SIGNATORIES } from '@/lib/constants';
import { fmtOfficialDate, fmtThaiDateFull, hhmm } from '@/lib/utils';
import type { DecoratedTask } from '@/lib/task-view';
import type { TaskReportDocProps } from '@/components/pdf/documents';

// Fetch a task's before/after photos (as embeddable data URLs) and assemble the
// props for its official report page. Shared by the single and batch exports.
export async function buildTaskReportProps(sb: SB, task: DecoratedTask): Promise<TaskReportDocProps> {
  const photos = await fetchTaskPhotos(sb, task.id);
  const toData = (kind: 'before' | 'after') =>
    Promise.all(photos.filter((p) => p.kind === kind).map((p) => urlToDataUrl(p.url)));
  const [beforeRaw, afterRaw] = await Promise.all([toData('before'), toData('after')]);
  const keep = (arr: (string | null)[]) => arr.filter((u): u is string => !!u);

  return {
    school: SCHOOL.name,
    dept: SCHOOL.dept,
    dateText: fmtOfficialDate(task.completed_at || task.assigned_date),
    assigneeName: task.assigneeName,
    reporter: task.reporter || '',
    location: task.location || '',
    title: task.title,
    materials: task.materials || '',
    timeStart: hhmm(task.time_start),
    timeEnd: hhmm(task.time_end),
    assignDateText: fmtThaiDateFull(task.assigned_date),
    assignTimeText: hhmm(task.assigned_time),
    statusDone: task.status === 'done',
    statusProgress: task.status === 'progress',
    beforeImgs: keep(beforeRaw),
    afterImgs: keep(afterRaw),
    signatories: SIGNATORIES,
  };
}
