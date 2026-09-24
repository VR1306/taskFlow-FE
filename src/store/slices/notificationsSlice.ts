import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Notification,
  NotificationsFilter,
  NotificationsResponse,
  UnreadCountResponse,
} from '@/types';
import { notificationsService } from '@/services';

export interface NotificationsState {
  notifications: Notification[];
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isActionLoading: boolean;
  isDropdownOpen: boolean;
  activeFilter: 'all' | 'unread';
  typeFilter: string;
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  error: string | null;
}

const initialState: NotificationsState = {
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

export const fetchNotifications = createAsyncThunk<
  NotificationsResponse,
  (NotificationsFilter & { forceRefresh?: boolean; unreadOnly?: boolean }) | undefined,
  { rejectValue: string }
>('notifications/fetchNotifications', async (input, { rejectWithValue }) => {
  const params = input ?? {};
  try {
    const filterParams: NotificationsFilter = {
      ...params,
      unread: params.unreadOnly ?? params.unread,
    };
    const response = await notificationsService.getNotifications(filterParams);
    return response;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load notifications');
  }
});

export const fetchUnreadCount = createAsyncThunk<
  UnreadCountResponse,
  void,
  { rejectValue: string }
>('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const response = await notificationsService.getUnreadCount();
    return response;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load unread count');
  }
});

export const markAsReadThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'notifications/markAsRead',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await notificationsService.markAsRead(id);
      dispatch(fetchUnreadCount());
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to mark notification as read'
      );
    }
  }
);

export const markAllAsReadThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await notificationsService.markAllAsRead();
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ page: 1 }));
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark all as read');
    }
  }
);

export const deleteNotificationThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'notifications/deleteNotification',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await notificationsService.deleteNotification(id);
      dispatch(fetchUnreadCount());
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete notification'
      );
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toggleNotificationDropdown(state) {
      state.isDropdownOpen = !state.isDropdownOpen;
    },
    setNotificationDropdownOpen(state, action: PayloadAction<boolean>) {
      state.isDropdownOpen = action.payload;
    },
    setNotificationFilter(state, action: PayloadAction<'all' | 'unread'>) {
      state.activeFilter = action.payload;
      state.currentPage = 1;
    },
    setNotificationTypeFilter(state, action: PayloadAction<string>) {
      state.typeFilter = action.payload;
      state.currentPage = 1;
    },
    setNotificationsCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setNotificationPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setNotificationsLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        const list = action.payload.data || [];
        state.notifications = list;
        state.items = list;
        state.totalItems = action.payload.pagination?.totalItems || list.length;
        state.totalPages = action.payload.pagination?.totalPages || 1;
        state.currentPage = action.payload.pagination?.currentPage || 1;
        if (action.payload.pagination?.unreadCount !== undefined) {
          state.unreadCount = action.payload.pagination.unreadCount;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data?.unreadCount || 0;
      })
      // Mark As Read
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        const targetId = action.payload;
        const updateItem = (item?: Notification) => {
          if (item && !item.isRead) {
            item.isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        };
        const item1 = state.notifications.find(
          (n) => n.id === targetId || n.notificationId === targetId || n._id === targetId
        );
        updateItem(item1);
        const item2 = state.items.find(
          (n) => n.id === targetId || n.notificationId === targetId || n._id === targetId
        );
        if (item2 && item2 !== item1) {
          item2.isRead = true;
        }
      })
      // Mark All Read
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.unreadCount = 0;
        for (const n of state.notifications) {
          n.isRead = true;
        }
        for (const n of state.items) {
          n.isRead = true;
        }
      })
      // Delete Notification
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.notifications = state.notifications.filter(
          (n) => n.id !== deletedId && n.notificationId !== deletedId && n._id !== deletedId
        );
        state.items = state.items.filter(
          (n) => n.id !== deletedId && n.notificationId !== deletedId && n._id !== deletedId
        );
      });
  },
});

export const {
  toggleNotificationDropdown,
  setNotificationDropdownOpen,
  setNotificationFilter,
  setNotificationTypeFilter,
  setNotificationsCurrentPage,
  setNotificationPage,
  setNotificationsLimit,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
