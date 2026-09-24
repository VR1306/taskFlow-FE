import { SelectOption } from '@/components/ui/Select';

export const NOTIFICATION_READ_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Status' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'read', label: 'Read Only' },
];

export const NOTIFICATION_TYPE_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Event Types' },
  { value: 'project_created', label: 'Project Created' },
  { value: 'project_updated', label: 'Project Updated' },
  { value: 'project_deleted', label: 'Project Deleted' },
  { value: 'project_member_added', label: 'Added to Project' },
  { value: 'project_member_removed', label: 'Removed from Project' },
  { value: 'task_assigned', label: 'Task Assigned' },
  { value: 'task_unassigned', label: 'Task Unassigned' },
  { value: 'task_completed', label: 'Task Completed' },
  { value: 'task_comment', label: 'Task Comment' },
  { value: 'task_deleted', label: 'Task Deleted' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_updated', label: 'User Updated' },
  { value: 'user_deleted', label: 'User Deleted' },
];

/**
 * Visual configuration (icon, color, label) for each notification type, shared by the
 * navbar dropdown and the full notifications page so both stay in sync.
 */
export const NOTIFICATION_TYPE_VISUALS: Record<
  string,
  {
    icon: string;
    bg: string;
    label: string;
    badgeVariant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'info';
  }
> = {
  project_created: {
    icon: '/icons/building.svg',
    bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Project Created',
    badgeVariant: 'success',
  },
  project_updated: {
    icon: '/icons/building.svg',
    bg: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Project Updated',
    badgeVariant: 'primary',
  },
  project_deleted: {
    icon: '/icons/trash.svg',
    bg: 'bg-rose-100 text-rose-700 border-rose-200',
    label: 'Project Deleted',
    badgeVariant: 'danger',
  },
  project_member_added: {
    icon: '/icons/plus.svg',
    bg: 'bg-purple-100 text-purple-700 border-purple-200',
    label: 'Added to Project',
    badgeVariant: 'purple',
  },
  project_member_removed: {
    icon: '/icons/edit.svg',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Removed from Project',
    badgeVariant: 'default',
  },
  task_assigned: {
    icon: '/icons/bolt.svg',
    bg: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Task Assigned',
    badgeVariant: 'primary',
  },
  task_unassigned: {
    icon: '/icons/bolt.svg',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Task Unassigned',
    badgeVariant: 'default',
  },
  task_completed: {
    icon: '/icons/check.svg',
    bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Task Completed',
    badgeVariant: 'success',
  },
  task_comment: {
    icon: '/icons/edit.svg',
    bg: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Task Comment',
    badgeVariant: 'warning',
  },
  task_deleted: {
    icon: '/icons/trash.svg',
    bg: 'bg-rose-100 text-rose-700 border-rose-200',
    label: 'Task Deleted',
    badgeVariant: 'danger',
  },
  user_created: {
    icon: '/icons/plus.svg',
    bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'User Created',
    badgeVariant: 'success',
  },
  user_updated: {
    icon: '/icons/edit.svg',
    bg: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'User Updated',
    badgeVariant: 'primary',
  },
  user_deleted: {
    icon: '/icons/trash.svg',
    bg: 'bg-rose-100 text-rose-700 border-rose-200',
    label: 'User Deleted',
    badgeVariant: 'danger',
  },
};

export const DEFAULT_NOTIFICATION_VISUAL = {
  icon: '/icons/bell.svg',
  bg: 'bg-slate-100 text-slate-700 border-slate-200',
  label: 'System Notification',
  badgeVariant: 'default' as const,
};

export const NOTIFICATIONS_CONSTANTS = {
  pageTitle: 'Notifications',
  pageSubtitle:
    'Stay up to date with user activities, role assignments, and organizational updates.',
  searchPlaceholder: 'Search notifications...',
  refreshButtonText: 'Refresh',
  refreshingButtonText: 'Refreshing...',
  markAllAsReadButtonText: 'Mark All as Read',
  unreadBadgeSuffix: 'Unread',
  loadingText: 'Loading notification stream...',

  emptyState: {
    title: 'No Notifications Found',
    filteredDescription: 'No notifications match your active search or filters.',
    defaultDescription: 'You are all caught up! No recent notifications to display.',
  },
} as const;

export default NOTIFICATIONS_CONSTANTS;
