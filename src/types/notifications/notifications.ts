export interface NotificationActor {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  profilePic?: string;
}

export interface Notification {
  id?: string;
  _id?: string;
  notificationId: string;
  title: string;
  message: string;
  type: string;
  targetRole?: string;
  actorName?: string;
  actorRole?: string;
  actor?: NotificationActor | null;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationItem = Notification;

export interface NotificationsFilter {
  search?: string;
  type?: string;
  unread?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationsPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  unreadCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  pagination: NotificationsPagination;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
  data?: { id: string; isRead?: boolean };
}
