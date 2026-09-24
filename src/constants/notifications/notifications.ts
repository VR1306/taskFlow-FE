import { SelectOption } from '@/components/ui/Select';

export const NOTIFICATION_READ_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Status' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'read', label: 'Read Only' },
];

export const NOTIFICATION_TYPE_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Event Types' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_updated', label: 'User Updated' },
  { value: 'user_deleted', label: 'User Deleted' },
];

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
