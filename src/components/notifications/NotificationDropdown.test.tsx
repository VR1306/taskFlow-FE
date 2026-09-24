import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NotificationDropdown } from './NotificationDropdown';
import authReducer from '@/store/slices/authSlice';
import notificationsReducer from '@/store/slices/notificationsSlice';
import { notificationsService } from '@/services';
import type { NotificationItem } from '@/types';

jest.mock('@/services');

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

const mockUser = {
  id: 'usr-1',
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@taskflow.com',
  role: 'Taskflow Admin',
  permissions: ['*'],
};

const mockNotification = {
  id: 'nt-1',
  notificationId: 'NT0001',
  title: 'New Member Onboarded',
  message: 'John Doe has been registered to TaskFlow Technologies',
  type: 'user_created',
  targetRole: 'Admin',
  actorName: 'Super Admin',
  actorRole: 'Taskflow Admin',
  actor: {
    id: 'usr-1',
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
  createdAt: new Date().toISOString(),
};

const createMockStore = (
  initialNotifs: NotificationItem[] = [mockNotification],
  unreadCount = 1
) => {
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
        notifications: initialNotifs,
        items: initialNotifs,
        unreadCount,
        isLoading: false,
        isActionLoading: false,
        isDropdownOpen: false,
        activeFilter: 'all' as const,
        typeFilter: 'all',
        currentPage: 1,
        limit: 10,
        totalItems: initialNotifs.length,
        totalPages: 1,
        error: null,
      },
    },
  });
};

describe('NotificationDropdown Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    jest
      .mocked(notificationsService.getNotifications)
      .mockImplementation(() => new Promise(() => {}));
    jest
      .mocked(notificationsService.getUnreadCount)
      .mockImplementation(() => new Promise(() => {}));
  });

  it('renders notification bell button with unread count badge', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <NotificationDropdown />
      </Provider>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('1');
  });

  it('opens dropdown popover when bell is clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <NotificationDropdown />
      </Provider>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New Member Onboarded')).toBeInTheDocument();
    expect(screen.getByText('Mark all as read')).toBeInTheDocument();
  });

  it('calls markAsRead when an unread notification is clicked', () => {
    (notificationsService.markAsRead as jest.Mock).mockResolvedValue({ success: true });
    const store = createMockStore();
    render(
      <Provider store={store}>
        <NotificationDropdown />
      </Provider>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    const item = screen.getByText('New Member Onboarded');
    fireEvent.click(item);

    expect(notificationsService.markAsRead).toHaveBeenCalledWith('NT0001');
  });
  it('navigates to the notification link and closes the dropdown when a linked notification is clicked', () => {
    (notificationsService.markAsRead as jest.Mock).mockResolvedValue({ success: true });
    const linked = { ...mockNotification, link: '/projects/proj-1?taskId=task-1' };
    render(
      <Provider store={createMockStore([linked])}>
        <NotificationDropdown />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    fireEvent.click(screen.getByText('New Member Onboarded'));

    expect(mockPush).toHaveBeenCalledWith('/projects/proj-1?taskId=task-1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marks a read notification as read without navigating when it has no link', () => {
    render(
      <Provider store={createMockStore([{ ...mockNotification, link: undefined }])}>
        <NotificationDropdown />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    fireEvent.click(screen.getByText('New Member Onboarded'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it.each(['Escape', 'outside'])('closes the dropdown on %s', (trigger) => {
    render(
      <Provider store={createMockStore()}>
        <NotificationDropdown />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    if (trigger === 'Escape') fireEvent.keyDown(document, { key: 'Escape' });
    else fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters unread cards and switches back to all notifications', () => {
    const read = {
      ...mockNotification,
      id: 'nt-2',
      notificationId: 'NT0002',
      title: 'Already read',
      isRead: true,
    };
    render(
      <Provider store={createMockStore([mockNotification, read])}>
        <NotificationDropdown />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('button', { name: /Unread/ }));
    expect(screen.queryByText('Already read')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    fireEvent.click(screen.getByText('Already read'));
    expect(notificationsService.markAsRead).not.toHaveBeenCalled();
  });

  it('marks all cards read and closes when navigating to the feed', async () => {
    jest
      .mocked(notificationsService.markAllAsRead)
      .mockResolvedValue({ success: true, message: 'Read' });
    render(
      <Provider store={createMockStore()}>
        <NotificationDropdown />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
    await waitFor(() => expect(notificationsService.markAllAsRead).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('link', { name: 'View All Notifications' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['user_deleted', 'user_updated', 'org_created', 'org_admin_assigned', 'system'])(
    'renders notification type %s',
    (type) => {
      render(
        <Provider store={createMockStore([{ ...mockNotification, type }], 120)}>
          <NotificationDropdown />
        </Provider>
      );
      expect(screen.getByTestId('notification-badge')).toHaveTextContent('99+');
      fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
      expect(screen.getByText(mockNotification.title)).toBeInTheDocument();
    }
  );

  it('renders nothing when there is no authenticated user', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        notifications: notificationsReducer,
      },
      preloadedState: {
        auth: {
          ...authReducer(undefined, { type: '@@INIT' }),
          user: null,
          isAuthenticated: false,
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <NotificationDropdown />
      </Provider>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to safe defaults when the notifications slice state is unavailable', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          ...authReducer(undefined, { type: '@@INIT' }),
          user: mockUser,
          isAuthenticated: true,
        },
      },
    });

    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Provider store={store as any}>
        <NotificationDropdown />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('falls back to the _id as the list key when a notification has no notificationId', () => {
    const legacyNotification = {
      ...mockNotification,
      notificationId: '',
      _id: 'legacy-id',
      title: 'Legacy notification',
    };
    render(
      <Provider store={createMockStore([legacyNotification])}>
        <NotificationDropdown />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(screen.getByText('Legacy notification')).toBeInTheDocument();
  });

  it('shows an empty state with the default copy when there are no notifications on the All tab', async () => {
    jest.mocked(notificationsService.getNotifications).mockResolvedValue({
      success: true,
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        unreadCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
    jest.mocked(notificationsService.getUnreadCount).mockResolvedValue({
      success: true,
      data: { unreadCount: 0 },
    });

    render(
      <Provider store={createMockStore([], 0)}>
        <NotificationDropdown />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
    expect(screen.getByText('Activity and updates will appear here.')).toBeInTheDocument();
  });

  it('shows an empty unread state after filtering read notifications', () => {
    render(
      <Provider store={createMockStore([{ ...mockNotification, isRead: true }], 0)}>
        <NotificationDropdown />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('button', { name: 'Unread' }));
    expect(screen.getByText("You've read all your notifications.")).toBeInTheDocument();
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });
});
