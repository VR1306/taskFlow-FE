import { configureStore } from '@reduxjs/toolkit';
import roles, { fetchRoles, fetchPermissionsCatalogue } from './rolesSlice';
import users, { fetchUsers } from './usersSlice';
import projects, { fetchProjects, fetchMemberCandidates } from './projectsSlice';
import notifications, {
  fetchNotifications,
  fetchUnreadCount,
  markAsReadThunk,
} from './notificationsSlice';
import dashboard, { fetchDashboardStats } from './dashboardSlice';
import { rolesService, projectsService } from '@/services';
import { dashboardService } from '@/services/dashboard';
import { apiClient } from '@/services/api';

jest.mock('@/services');
jest.mock('@/services/api');
jest.mock('@/services/dashboard');
const createStore = () =>
  configureStore({ reducer: { roles, users, projects, notifications, dashboard } });
beforeEach(() => jest.clearAllMocks());

it.each([{ data: [] }, { data: [{ id: 'record' }] }])(
  'calculates pagination when list responses omit metadata: %j',
  async ({ data }) => {
    (rolesService.getRoles as jest.Mock).mockResolvedValue({ data });
    (projectsService.getProjects as jest.Mock).mockResolvedValue({ data });
    (apiClient.get as jest.Mock).mockResolvedValue({ data });
    const store = createStore();
    await store.dispatch(
      fetchRoles({ page: 2, limit: 5, roleType: '', status: '', search: ' test ' })
    );
    await store.dispatch(fetchProjects({ page: 2, limit: 5, status: '', search: ' test ' }));
    await store.dispatch(fetchUsers({ page: 2, limit: 5, role: '', status: '', search: ' test ' }));
    for (const state of [
      store.getState().roles,
      store.getState().projects,
      store.getState().users,
    ]) {
      expect(state.totalItems).toBe(data.length);
      expect(state.totalPages).toBe(1);
      expect(state.currentPage).toBe(2);
      expect(state.search).toBe('test');
    }
  }
);

it('provides empty list defaults for incomplete API responses', async () => {
  (rolesService.getPermissionsCatalogue as jest.Mock).mockResolvedValue({});
  (projectsService.getMemberCandidates as jest.Mock).mockResolvedValue({});
  (apiClient.get as jest.Mock).mockResolvedValue({});
  const store = createStore();
  await store.dispatch(fetchPermissionsCatalogue());
  await store.dispatch(fetchMemberCandidates());
  await store.dispatch(fetchUsers());
  expect(store.getState().roles.permissionsCatalogue).toEqual([]);
  expect(store.getState().projects.memberCandidates).toEqual([]);
  expect(store.getState().users.totalItems).toBe(0);
});

it('uses fallback messages for failures without Error objects', async () => {
  (rolesService.getPermissionsCatalogue as jest.Mock).mockRejectedValue(null);
  (apiClient.get as jest.Mock).mockRejectedValue(null);
  const store = createStore();
  expect((await store.dispatch(fetchPermissionsCatalogue())).payload).toBe(
    'Failed to retrieve permissions catalogue.'
  );
  expect((await store.dispatch(fetchUsers())).payload).toBe('Failed to fetch users list');
});

it.each(['fetchRoles', 'createRole', 'updateRole', 'deleteRole'])(
  'supplies a fallback for roles/%s rejection without a payload',
  (operation) => {
    const state = roles(undefined, { type: `roles/${operation}/rejected`, meta: {} });
    expect(state.error).toMatch(/^Failed to /);
  }
);

it.each(['fetchUsers', 'createUser', 'updateUser', 'deleteUser'])(
  'supplies a fallback for users/%s rejection without a payload',
  (operation) => {
    const state = users(undefined, { type: `users/${operation}/rejected`, meta: {} });
    expect(state.error).toMatch(/^Failed to /);
  }
);

it('handles partial notification responses without losing existing badge state', () => {
  let state = notifications(undefined, { type: fetchNotifications.fulfilled.type, payload: {} });
  expect(state.items).toEqual([]);
  expect(state.totalItems).toBe(0);
  expect(state.currentPage).toBe(1);
  state = notifications(state, { type: fetchUnreadCount.fulfilled.type, payload: {} });
  expect(state.unreadCount).toBe(0);
  state = notifications(state, { type: fetchNotifications.rejected.type });
  expect(state.error).toBe('Failed to fetch notifications');
});

it.each(['NT1', 'internal', 'missing'])(
  'marks notifications by alternate identifier %s without negative badge counts',
  (id) => {
    const item = {
      _id: 'internal',
      notificationId: 'NT1',
      title: 'Welcome',
      message: 'Message',
      type: 'system',
      createdAt: '',
      isRead: false,
    };
    const initial = {
      ...notifications(undefined, { type: 'init' }),
      notifications: [item],
      items: [{ ...item }],
    };
    const state = notifications(initial, markAsReadThunk.fulfilled(id, 'request', id));
    expect(state.unreadCount).toBe(0);
    expect(state.notifications[0].isRead).toBe(id !== 'missing');
    expect(notifications(state, markAsReadThunk.fulfilled(id, 'request', id)).unreadCount).toBe(0);
  }
);

it.each([undefined, {}, { success: true }, { message: 'Server unavailable' }])(
  'rejects incomplete dashboard responses: %j',
  async (response) => {
    (dashboardService.getDashboardStats as jest.Mock).mockResolvedValue(response);
    const store = createStore();
    await store.dispatch(fetchDashboardStats());
    expect(store.getState().dashboard.error).toBe(
      response?.message || 'Failed to fetch dashboard statistics.'
    );
  }
);

it('provides dashboard fallback messages for non-Error failures and rejected actions', async () => {
  (dashboardService.getDashboardStats as jest.Mock).mockRejectedValue(null);
  const store = createStore();
  await store.dispatch(fetchDashboardStats());
  expect(store.getState().dashboard.error).toBe('Failed to fetch dashboard statistics.');
  expect(dashboard(undefined, { type: fetchDashboardStats.rejected.type }).error).toBe(
    'Failed to load dashboard data.'
  );
});
