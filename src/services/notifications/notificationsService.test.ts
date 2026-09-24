import { notificationsService } from './notificationsService';
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('notificationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getNotifications calls apiClient.get with query params', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ success: true, data: [] });

    await notificationsService.getNotifications({
      page: 1,
      limit: 10,
      type: 'user_created',
      unread: true,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/notifications?page=1&limit=10&type=user_created&unread=true'
    );
  });

  it('getUnreadCount calls apiClient.get', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ success: true, data: { unreadCount: 3 } });

    const res = await notificationsService.getUnreadCount();

    expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(res.data.unreadCount).toBe(3);
  });

  it('markAsRead calls apiClient.patch', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValue({ success: true, message: 'Read' });

    await notificationsService.markAsRead('NT0001');

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/NT0001/read');
  });

  it('markAllAsRead calls apiClient.post', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ success: true, message: 'All Read' });

    await notificationsService.markAllAsRead();

    expect(apiClient.post).toHaveBeenCalledWith('/notifications/read-all');
  });
});

it('deletes using an encoded notification identifier', async () => {
  await notificationsService.deleteNotification('NT/1');
  expect(apiClient.delete).toHaveBeenCalledWith('/notifications/NT%2F1');
});

it('omits default filters and trims search input', async () => {
  await notificationsService.getNotifications();
  expect(apiClient.get).toHaveBeenCalledWith('/notifications');
  await notificationsService.getNotifications({ type: 'all', search: ' Ada ', unread: false });
  expect(apiClient.get).toHaveBeenCalledWith('/notifications?search=Ada');
});
