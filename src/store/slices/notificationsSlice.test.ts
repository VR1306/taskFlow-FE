import notificationsReducer, {
  toggleNotificationDropdown,
  setNotificationDropdownOpen,
  setNotificationFilter,
  setNotificationTypeFilter,
  setNotificationsCurrentPage,
  setNotificationPage,
  setNotificationsLimit,
  fetchNotifications,
  fetchUnreadCount,
  markAsReadThunk,
  markAllAsReadThunk,
  deleteNotificationThunk,
  NotificationsState,
} from './notificationsSlice';
import { notificationsService } from '@/services';

jest.mock('@/services');

describe('notificationsSlice Redux Reducer & Async Thunks', () => {
  const initialNotifState: NotificationsState = {
    notifications: [],
    items: [],
    unreadCount: 0,
    isLoading: false,
    isActionLoading: false,
    isDropdownOpen: false,
    activeFilter: 'all',
    typeFilter: 'all',
    currentPage: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1,
    error: null,
  };

  const mockNotification = {
    id: 'notif-1',
    _id: 'notif-1',
    notificationId: 'NT0001',
    title: 'User Added',
    message: 'John Doe was created',
    type: 'user_created',
    targetRole: 'Admin',
    actorName: 'Super Admin',
    actorRole: 'Taskflow Admin',
    actor: {
      id: 'usr-admin',
      name: 'Super Admin',
      email: 'admin@taskflow.com',
      role: 'Taskflow Admin',
    },
    organization: {
      id: 'org-1',
      name: 'TaskFlow Technologies',
      orgId: 'ORG0001',
    },
    isRead: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Synchronous Reducers', () => {
    it('should return initial state', () => {
      expect(notificationsReducer(undefined, { type: 'unknown' })).toEqual(initialNotifState);
    });

    it('should toggle and set dropdown open', () => {
      let state = notificationsReducer(initialNotifState, toggleNotificationDropdown());
      expect(state.isDropdownOpen).toBe(true);

      state = notificationsReducer(state, setNotificationDropdownOpen(false));
      expect(state.isDropdownOpen).toBe(false);
    });

    it('should handle filter and pagination actions', () => {
      let state = notificationsReducer(initialNotifState, setNotificationFilter('unread'));
      expect(state.activeFilter).toBe('unread');
      expect(state.currentPage).toBe(1);

      state = notificationsReducer(state, setNotificationTypeFilter('user_created'));
      expect(state.typeFilter).toBe('user_created');
      expect(state.currentPage).toBe(1);

      state = notificationsReducer(state, setNotificationsCurrentPage(2));
      expect(state.currentPage).toBe(2);

      state = notificationsReducer(state, setNotificationsLimit(20));
      expect(state.limit).toBe(20);
    });
  });

  describe('Async Thunks', () => {
    it('fetchNotifications.fulfilled populates list and unread count', async () => {
      const mockResponse = {
        success: true,
        data: [mockNotification],
        pagination: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 15,
          unreadCount: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      (notificationsService.getNotifications as jest.Mock).mockResolvedValue(mockResponse);

      const nextState = notificationsReducer(initialNotifState, {
        type: fetchNotifications.fulfilled.type,
        payload: mockResponse,
      });

      expect(nextState.notifications).toEqual([mockNotification]);
      expect(nextState.items).toEqual([mockNotification]);
      expect(nextState.unreadCount).toBe(1);
      expect(nextState.isLoading).toBe(false);
    });

    it('fetchUnreadCount.fulfilled updates unread count', async () => {
      const nextState = notificationsReducer(initialNotifState, {
        type: fetchUnreadCount.fulfilled.type,
        payload: { success: true, data: { unreadCount: 5 } },
      });

      expect(nextState.unreadCount).toBe(5);
    });

    it('markAsReadThunk.fulfilled updates notification item and decrements unread count', async () => {
      const stateWithNotif = {
        ...initialNotifState,
        notifications: [mockNotification],
        items: [mockNotification],
        unreadCount: 1,
      };

      const nextState = notificationsReducer(stateWithNotif, {
        type: markAsReadThunk.fulfilled.type,
        payload: 'notif-1',
      });

      expect(nextState.notifications[0].isRead).toBe(true);
      expect(nextState.unreadCount).toBe(0);
    });

    it('markAllAsReadThunk.fulfilled marks all items as read and resets unread count', async () => {
      const stateWithNotifs = {
        ...initialNotifState,
        notifications: [mockNotification, { ...mockNotification, id: 'notif-2', _id: 'notif-2' }],
        items: [mockNotification, { ...mockNotification, id: 'notif-2', _id: 'notif-2' }],
        unreadCount: 2,
      };

      const nextState = notificationsReducer(stateWithNotifs, {
        type: markAllAsReadThunk.fulfilled.type,
      });

      expect(nextState.unreadCount).toBe(0);
      expect(nextState.notifications.every((n) => n.isRead)).toBe(true);
    });
  });
  it('sets the alternate page action', () => {
    expect(notificationsReducer(initialNotifState, setNotificationPage(3)).currentPage).toBe(3);
  });

  it.each(['notif-1', 'NT0001', 'internal-id'])(
    'removes notifications using identifier %s',
    (id) => {
      const item = { ...mockNotification, _id: 'internal-id' };
      const state = notificationsReducer(
        { ...initialNotifState, notifications: [item], items: [item] },
        deleteNotificationThunk.fulfilled(id, 'request', id)
      );
      expect(state.notifications).toEqual([]);
      expect(state.items).toEqual([]);
    }
  );

  it.each([new Error('Offline'), null])(
    'handles notification fetch failures: %j',
    async (error) => {
      jest.mocked(notificationsService.getNotifications).mockRejectedValue(error);
      const dispatch = jest.fn();
      const action = await fetchNotifications()(dispatch, jest.fn(), undefined);
      expect(action.payload).toBe(
        error instanceof Error ? 'Offline' : 'Failed to load notifications'
      );
      expect(notificationsReducer(initialNotifState, action).isLoading).toBe(false);
    }
  );

  it.each([new Error('Offline'), null])('handles unread count failures: %j', async (error) => {
    jest.mocked(notificationsService.getUnreadCount).mockRejectedValue(error);
    const action = await fetchUnreadCount()(jest.fn(), jest.fn(), undefined);
    expect(action.payload).toBe(error instanceof Error ? 'Offline' : 'Failed to load unread count');
  });

  it.each([new Error('Offline'), null])('handles read and delete failures: %j', async (error) => {
    jest.mocked(notificationsService.markAsRead).mockRejectedValue(error);
    jest.mocked(notificationsService.markAllAsRead).mockRejectedValue(error);
    jest.mocked(notificationsService.deleteNotification).mockRejectedValue(error);
    const read = await markAsReadThunk('NT0001')(jest.fn(), jest.fn(), undefined);
    const all = await markAllAsReadThunk()(jest.fn(), jest.fn(), undefined);
    const deleted = await deleteNotificationThunk('NT0001')(jest.fn(), jest.fn(), undefined);
    expect(read.payload).toBe(
      error instanceof Error ? 'Offline' : 'Failed to mark notification as read'
    );
    expect(all.payload).toBe(error instanceof Error ? 'Offline' : 'Failed to mark all as read');
    expect(deleted.payload).toBe(
      error instanceof Error ? 'Offline' : 'Failed to delete notification'
    );
  });

  it('deletes through the service and refreshes the badge', async () => {
    jest
      .mocked(notificationsService.deleteNotification)
      .mockResolvedValue({ success: true, message: 'Deleted' });
    const dispatch = jest.fn();
    const action = await deleteNotificationThunk('NT0001')(dispatch, jest.fn(), undefined);
    expect(notificationsService.deleteNotification).toHaveBeenCalledWith('NT0001');
    expect(action.payload).toBe('NT0001');
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
