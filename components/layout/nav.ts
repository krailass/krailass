import {
  LayoutDashboard,
  Users,
  ListChecks,
  Plus,
  UserCog,
  CheckCircle2,
  FileText,
  ClipboardList,
  BarChart3,
  KanbanSquare,
  Ellipsis,
  CircleUserRound,
  QrCode,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/database.types';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ADMIN_NAV: NavItem[] = [
  { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/dashboard/by-person', label: 'งานรายบุคคล', icon: Users },
  { href: '/admin/tasks', label: 'งานทั้งหมด', icon: ListChecks },
  { href: '/admin/assign', label: 'มอบหมายงาน', icon: Plus },
  { href: '/admin/staff', label: 'จัดการนักการ', icon: UserCog },
  { href: '/admin/approve', label: 'ตรวจ & อนุมัติ', icon: CheckCircle2 },
  { href: '/admin/reports', label: 'รายงาน PDF', icon: FileText },
  { href: '/admin/about', label: 'เกี่ยวกับระบบ', icon: QrCode },
];

const JANITOR_NAV: NavItem[] = [
  { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/janitor/board', label: 'งานของฉัน', icon: KanbanSquare },
  { href: '/janitor/report', label: 'ส่งรายงาน', icon: ClipboardList },
  { href: '/janitor/stats', label: 'สถิติ', icon: BarChart3 },
  { href: '/janitor/profile', label: 'ข้อมูลส่วนตัว', icon: CircleUserRound },
];

export function navFor(role: UserRole): NavItem[] {
  return role === 'admin' ? ADMIN_NAV : JANITOR_NAV;
}

export const ROLE_META: Record<UserRole, { label: string; sub: string }> = {
  admin: { label: 'หัวหน้าอาคารสถานที่', sub: 'กลุ่มบริหารทั่วไป' },
  janitor: { label: 'นักการภารโรง', sub: 'ผู้ปฏิบัติงาน' },
};

/** Slot 5 of the mobile bar: either a "More" sheet (admin) or a direct link (janitor → profile). */
export type BottomSlot5 =
  | { kind: 'more'; label: string; icon: LucideIcon; items: NavItem[] }
  | { kind: 'link'; label: string; icon: LucideIcon; href: string };

export interface BottomBar {
  left: [NavItem, NavItem];
  fab: { href: string; label: string; icon: LucideIcon };
  right: NavItem;
  slot5: BottomSlot5;
}

/** 5-slot mobile bottom bar: [nav][nav][raised FAB][nav][slot5]. */
export function bottomBarFor(role: UserRole): BottomBar {
  const items = navFor(role);
  const at = (href: string) => items.find((i) => i.href === href) ?? items[0];
  if (role === 'admin') {
    return {
      left: [at('/dashboard'), at('/admin/tasks')],
      fab: { href: '/admin/assign', label: 'มอบหมาย', icon: Plus },
      right: at('/admin/approve'),
      slot5: {
        kind: 'more',
        label: 'เพิ่มเติม',
        icon: Ellipsis,
        items: [
          at('/dashboard/by-person'),
          at('/admin/staff'),
          at('/admin/reports'),
          at('/admin/about'),
        ],
      },
    };
  }
  return {
    left: [at('/dashboard'), at('/janitor/board')],
    fab: { href: '/janitor/report', label: 'ส่งรายงาน', icon: ClipboardList },
    right: at('/janitor/stats'),
    slot5: { kind: 'link', label: 'ข้อมูลส่วนตัว', icon: CircleUserRound, href: '/janitor/profile' },
  };
}
