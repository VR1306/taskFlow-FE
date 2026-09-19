import dashboardReducer, {
  fetchDashboardStats,
  clearDashboardError,
  resetDashboardState,
  DashboardState,
} from './dashboardSlice';
import { dashboardService } from '@/services/dashboard';

jest.mock('@/services/dashboard', () => ({
  dashboardService: {
    getDashboardStats: jest.fn(),
  },
}));

describe('dashboardSlice', () => {
  const initialDashboardState: DashboardState = {
    stats: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastFetched: null,
  };

  const mockStats = {
    summary: {
      totalUsers: 10,
      activeUsers: 8,
      inactiveUsers: 2,
      totalRoles: 4,
      systemRoles: 3,
      customRoles: 1,
      activeRoles: 4,
      totalPermissions: 28,
    },
    usersByRole: [
      { role: 'SuperAdmin', label: 'Super Admin', count: 2, percentage: 20, color: '#6366f1' },
    ],
    usersByStatus: [{ status: 'Active', count: 8, percentage: 80, color: '#10b981' }],
    rolesByType: [{ type: 'System', count: 3, percentage: 75, color: '#8b5cf6' }],
    userRegistrationTrends: [{ month: 'Sep', year: 2026, count: 5 }],
    rolePermissionsDistribution: [{ roleName: 'Super Admin', permissionsCount: 28, usersCount: 2 }],
    recentUsers: [],
    recentRoles: [],
  };

  it('should return the initial state', () => {
    expect(dashboardReducer(undefined, { type: 'unknown' })).toEqual(initialDashboardState);
  });

  it('should handle clearDashboardError', () => {
    const stateWithError: DashboardState = {
      ...initialDashboardState,
      error: 'An error occurred',
    };
    expect(dashboardReducer(stateWithError, clearDashboardError())).toEqual({
      ...stateWithError,
      error: null,
    });
  });

  it('should handle resetDashboardState', () => {
    const populatedState: DashboardState = {
      stats: mockStats,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastFetched: '2026-09-19T00:00:00.000Z',
    };
    expect(dashboardReducer(populatedState, resetDashboardState())).toEqual(initialDashboardState);
  });

  it('sets isLoading to true on fetchDashboardStats.pending when no stats exist', () => {
    const action = { type: fetchDashboardStats.pending.type, meta: { arg: false } };
    const state = dashboardReducer(initialDashboardState, action);
    expect(state.isLoading).toBe(true);
    expect(state.isRefreshing).toBe(false);
  });

  it('sets isRefreshing to true on fetchDashboardStats.pending when isRefresh is true', () => {
    const action = { type: fetchDashboardStats.pending.type, meta: { arg: true } };
    const state = dashboardReducer(initialDashboardState, action);
    expect(state.isLoading).toBe(false);
    expect(state.isRefreshing).toBe(true);
  });

  it('sets stats on fetchDashboardStats.fulfilled', () => {
    const action = {
      type: fetchDashboardStats.fulfilled.type,
      payload: { stats: mockStats, isRefresh: false },
    };
    const state = dashboardReducer(initialDashboardState, action);
    expect(state.isLoading).toBe(false);
    expect(state.isRefreshing).toBe(false);
    expect(state.stats).toEqual(mockStats);
    expect(state.lastFetched).toBeDefined();
    expect(state.error).toBeNull();
  });

  it('sets error on fetchDashboardStats.rejected', () => {
    const action = {
      type: fetchDashboardStats.rejected.type,
      payload: 'Server error',
    };
    const state = dashboardReducer(initialDashboardState, action);
    expect(state.isLoading).toBe(false);
    expect(state.isRefreshing).toBe(false);
    expect(state.error).toBe('Server error');
  });

  it('fetchDashboardStats thunk calls dashboardService successfully', async () => {
    (dashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: mockStats,
    });

    const dispatch = jest.fn();
    const thunk = fetchDashboardStats(false);
    const result = await thunk(dispatch, () => ({}), undefined);

    expect(result.payload).toEqual({ stats: mockStats, isRefresh: false });
  });

  it('fetchDashboardStats thunk rejects on failure response', async () => {
    (dashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Failed to load stats',
    });

    const dispatch = jest.fn();
    const thunk = fetchDashboardStats(false);
    const result = await thunk(dispatch, () => ({}), undefined);

    expect(result.payload).toBe('Failed to load stats');
  });
});
