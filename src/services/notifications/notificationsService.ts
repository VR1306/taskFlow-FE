import { apiClient } from '@/services/api';
import {
  NotificationsResponse,
  UnreadCountResponse,
  NotificationActionResponse,
  NotificationsFilter,
} from '@/types';

export const notificationsService = {
  getNotifications: async (
    params: Readonly<NotificationsFilter> = {}
  ): Promise<NotificationsResponse> => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search.trim());
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.unread) query.set('unread', 'true');

    const queryString = query.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    return apiClient.get<NotificationsResponse>(endpoint);
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  },

  markAsRead: async (id: string): Promise<NotificationActionResponse> => {
    return apiClient.patch<NotificationActionResponse>(
      `/notifications/${encodeURIComponent(id)}/read`
    );
  },

  markAllAsRead: async (): Promise<NotificationActionResponse> => {
    return apiClient.post<NotificationActionResponse>('/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<NotificationActionResponse> => {
    return apiClient.delete<NotificationActionResponse>(`/notifications/${encodeURIComponent(id)}`);
  },
};

export default notificationsService;
