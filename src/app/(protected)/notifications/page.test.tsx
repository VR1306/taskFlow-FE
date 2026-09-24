import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NotificationsPage from './page';
import authReducer from '@/store/slices/authSlice';
import notificationsReducer from '@/store/slices/notificationsSlice';
import { notificationsService } from '@/services';
import { NOTIFICATIONS_CONSTANTS } from '@/constants';
import type { NotificationItem } from '@/types';

jest.mock('@/services');

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

const mockUser = {
  id: 'usr-1',
  firstName: 'Taskflow',
  lastName: 'Admin',
  email: 'admin@taskflow.com',
  role: 'Taskflow Admin',
  permissions: ['*'],
};

const mockNotification = {
  id: 'nt-1',
  notificationId: 'NT0001',
  title: 'New User Registered',
  message: 'Jamie Rivera (Developer) was added by Taskflow Admin',
  type: 'user_created',
  targetRole: 'All',
  actorName: 'Taskflow Admin',
  actorRole: 'Taskflow Admin',
  actor: {
    id: 'usr-1',
    name: 'Taskflow Admin',
    email: 'admin@taskflow.com',
    role: 'Taskflow Admin',
  },
  isRead: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const createMockStore = (unreadCount = 1, items: NotificationItem[] = [mockNotification]) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationsReducer,
    },
    preloadedState: {
      auth: {
        ...authReducer(undefined, { type: '@@INIT' }),
        user: mockUser,
        isAuthenticated: true,
      },
      notifications: {
        notifications: items,
        items,
        unreadCount,
        isLoading: false,
        isActionLoading: false,
        isDropdownOpen: false,
        activeFilter: 'all' as const,
        typeFilter: 'all',
        currentPage: 1,
        limit: 15,
        totalItems: 1,
        totalPages: 1,
        error: null,
      },
    },
  });
};

describe('NotificationsPage Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    (notificationsService.getNotifications as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockNotification],
      pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 15, unreadCount: 1 },
    });
    (notificationsService.getUnreadCount as jest.Mock).mockResolvedValue({
      success: true,
      data: { unreadCount: 1 },
    });
  });

  it('renders notifications page header, search bar, and notification card', () => {
    const store = createMockStore(1);

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText('New User Registered')).toBeInTheDocument();
    expect(
      screen.getByText('Jamie Rivera (Developer) was added by Taskflow Admin')
    ).toBeInTheDocument();
  });

  it('marks all as read when button is clicked', async () => {
    (notificationsService.markAllAsRead as jest.Mock).mockResolvedValue({ success: true });
    const store = createMockStore(1);

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    const markAllBtn = screen.getByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notificationsService.markAllAsRead).toHaveBeenCalled();
    });
  });

  it('triggers a forced refresh when the Refresh button is clicked', async () => {
    const store = createMockStore(1);

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    const refreshBtn = await screen.findByRole('button', { name: 'Refresh' });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(notificationsService.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({ forceRefresh: true })
      );
    });
  });

  it('renders nothing during server-side rendering, before the client has mounted', () => {
    const store = createMockStore();

    const html = renderToString(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    expect(html).toBe('');
  });

  it('falls back to the id or _id fields for the list key when notificationId is missing', async () => {
    const events = [
      {
        ...mockNotification,
        notificationId: undefined,
        id: 'fallback-id',
        title: 'Falls back to id',
      },
      {
        ...mockNotification,
        notificationId: undefined,
        id: undefined,
        _id: 'fallback-underscore-id',
        title: 'Falls back to underscore id',
      },
    ];
    const store = createMockStore(0, events as unknown as NotificationItem[]);

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    expect(screen.getByText('Falls back to id')).toBeInTheDocument();
    expect(screen.getByText('Falls back to underscore id')).toBeInTheDocument();
  });

  it('navigates to the notification link when a linked notification is clicked', async () => {
    const linked = { ...mockNotification, link: '/projects/proj-1' };
    const store = createMockStore(1, [linked]);

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    fireEvent.click(screen.getByText('New User Registered'));

    expect(mockPush).toHaveBeenCalledWith('/projects/proj-1');
  });

  it('does not navigate when a notification has no link', async () => {
    const store = createMockStore(1, [{ ...mockNotification, link: undefined }]);

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    fireEvent.click(screen.getByText('New User Registered'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('changes page and rows-per-page via the pagination controls', async () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        notifications: notificationsReducer,
      },
      preloadedState: {
        auth: {
          ...authReducer(undefined, { type: '@@INIT' }),
          user: mockUser,
          isAuthenticated: true,
        },
        notifications: {
          notifications: [mockNotification],
          items: [mockNotification],
          unreadCount: 1,
          isLoading: false,
          isActionLoading: false,
          isDropdownOpen: false,
          activeFilter: 'all' as const,
          typeFilter: 'all',
          currentPage: 1,
          limit: 15,
          totalItems: 20,
          totalPages: 2,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    const pageTwoBtn = screen.getByRole('button', { name: 'Page 2' });
    fireEvent.click(pageTwoBtn);

    await waitFor(() => {
      expect(store.getState().notifications.currentPage).toBe(2);
    });

    const rowsPerPageSelect = screen.getByLabelText('Rows per page');
    fireEvent.change(rowsPerPageSelect, { target: { value: '20' } });

    await waitFor(() => {
      expect(store.getState().notifications.limit).toBe(20);
    });
  });

  it('renders the default empty state when there are no notifications and no active filters', async () => {
    (notificationsService.getNotifications as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [],
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, limit: 15, unreadCount: 0 },
    });
    const store = createMockStore(0, []);

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(NOTIFICATIONS_CONSTANTS.emptyState.defaultDescription)
      ).toBeInTheDocument();
    });
  });
});

describe('NotificationsPage without an authenticated user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch notifications when there is no current user', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        notifications: notificationsReducer,
      },
    });

    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    expect(notificationsService.getNotifications).not.toHaveBeenCalled();
    expect(notificationsService.getUnreadCount).not.toHaveBeenCalled();
  });
});

describe('notification feed actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (notificationsService.getNotifications as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    (notificationsService.getUnreadCount as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
  });

  it('renders event variants and only marks unread events', async () => {
    const events = [
      {
        ...mockNotification,
        notificationId: 'deleted',
        title: 'Deleted account',
        type: 'user_deleted',
        isRead: true,
        actor: undefined,
      },
      {
        ...mockNotification,
        notificationId: 'updated',
        title: 'Updated account',
        type: 'user_updated',
        actor: { ...mockNotification.actor, firstName: 'Jamie', lastName: 'Rivera' },
      },
      {
        ...mockNotification,
        notificationId: 'system',
        title: 'System event',
        type: 'custom_event',
      },
    ];
    (notificationsService.markAsRead as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'updated', isRead: true },
    });
    render(
      <Provider store={createMockStore(2, events)}>
        <NotificationsPage />
      </Provider>
    );
    expect(screen.getByText('System Notification')).toBeInTheDocument();
    expect(screen.getByText('User Deleted')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Deleted account/ }));
    expect(notificationsService.markAsRead).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Updated account/ }));
    await waitFor(() => expect(notificationsService.markAsRead).toHaveBeenCalledWith('updated'));
  });

  it('filters notifications by read status and by event type via the Select controls', async () => {
    const events = [
      {
        ...mockNotification,
        notificationId: 'deleted',
        title: 'Deleted account',
        type: 'user_deleted',
        isRead: true,
      },
      {
        ...mockNotification,
        notificationId: 'updated',
        title: 'Updated account',
        type: 'user_updated',
        isRead: false,
      },
      {
        ...mockNotification,
        notificationId: 'system',
        title: 'System event',
        type: 'custom_event',
        isRead: false,
      },
    ];

    render(
      <Provider store={createMockStore(2, events)}>
        <NotificationsPage />
      </Provider>
    );

    expect(screen.getByText('Deleted account')).toBeInTheDocument();
    expect(screen.getByText('Updated account')).toBeInTheDocument();
    expect(screen.getByText('System event')).toBeInTheDocument();

    // Filter by read status: Unread Only
    const readStatusControl = screen.getByText('All Status');
    fireEvent.mouseDown(readStatusControl);
    fireEvent.click(screen.getByRole('option', { name: 'Unread Only' }));

    expect(screen.queryByText('Deleted account')).not.toBeInTheDocument();
    expect(screen.getByText('Updated account')).toBeInTheDocument();
    expect(screen.getByText('System event')).toBeInTheDocument();

    // Switch to Read Only
    const readStatusControlUnread = screen.getByText('Unread Only');
    fireEvent.mouseDown(readStatusControlUnread);
    fireEvent.click(screen.getByRole('option', { name: 'Read Only' }));

    expect(screen.getByText('Deleted account')).toBeInTheDocument();
    expect(screen.queryByText('Updated account')).not.toBeInTheDocument();
    expect(screen.queryByText('System event')).not.toBeInTheDocument();

    // Reset back to All Status
    const readStatusControlRead = screen.getByText('Read Only');
    fireEvent.mouseDown(readStatusControlRead);
    fireEvent.click(screen.getByRole('option', { name: 'All Status' }));

    // Filter by event type: User Deleted
    const typeControl = screen.getByText('All Event Types');
    fireEvent.mouseDown(typeControl);
    fireEvent.click(screen.getByRole('option', { name: 'User Deleted' }));

    expect(screen.getByText('Deleted account')).toBeInTheDocument();
    expect(screen.queryByText('Updated account')).not.toBeInTheDocument();
    expect(screen.queryByText('System event')).not.toBeInTheDocument();
  });

  it('searches notification messages and displays a filtered empty state', async () => {
    render(
      <Provider store={createMockStore()}>
        <NotificationsPage />
      </Provider>
    );
    const search = screen.getByPlaceholderText(NOTIFICATIONS_CONSTANTS.searchPlaceholder);
    fireEvent.change(search, { target: { value: 'Jamie' } });
    await waitFor(() => expect(screen.getByText(mockNotification.title)).toBeInTheDocument());
    fireEvent.change(search, { target: { value: 'no matching notification' } });
    expect(
      await screen.findByText(NOTIFICATIONS_CONSTANTS.emptyState.filteredDescription)
    ).toBeInTheDocument();
  });
});
