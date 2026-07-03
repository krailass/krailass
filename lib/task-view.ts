import type { TaskRow, ProfileRow } from './database.types';
import { STATUS_META, APPROVAL_META, PRIORITY_META } from './constants';
import { categoryColor, initial } from './utils';

export interface TaskWithAssignee extends TaskRow {
  assignee: Pick<ProfileRow, 'id' | 'full_name' | 'zone'> | null;
}

export interface DecoratedTask extends TaskWithAssignee {
  assigneeName: string;
  assigneeInitial: string;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  statusDot: string;
  catBg: string;
  catText: string;
  isUrgent: boolean;
  priorityLabel: string;
  approvalLabel: string | null;
  approvalColor: string | null;
  approvalBg: string | null;
  dueDisplay: string;
}

export function decorateTask(t: TaskWithAssignee): DecoratedTask {
  const sm = STATUS_META[t.status];
  const cc = categoryColor(t.category);
  const showApproval = t.status === 'done' && t.approval != null;
  const am = showApproval && t.approval ? APPROVAL_META[t.approval] : null;
  const name = t.assignee?.full_name || '—';
  return {
    ...t,
    assigneeName: name,
    assigneeInitial: initial(name),
    statusLabel: sm.label,
    statusColor: sm.color,
    statusBg: sm.bg,
    statusDot: sm.dot,
    catBg: cc.bg,
    catText: cc.text,
    isUrgent: t.priority === 'urgent',
    priorityLabel: PRIORITY_META[t.priority].label,
    approvalLabel: am?.label ?? null,
    approvalColor: am?.color ?? null,
    approvalBg: am?.bg ?? null,
    dueDisplay: t.due_text || t.due_date || '—',
  };
}
