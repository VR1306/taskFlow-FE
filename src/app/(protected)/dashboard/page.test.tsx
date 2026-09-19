import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from './page';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import rolesReducer from '@/store/slices/rolesSlice';
import dashboardReducer from '@/store/slices/dashboardSlice';
import { dashboardService } from '@/services/dashboard';
import { authStorage } from '@/helpers';

jest.mock('@/services/dashboard', () => ({
  dashboardService: {
    getDashboardStats: jest.fn(),
  },
}));

const mockDashboardStats = {
  summary: {
    totalUsers: 12,
    activeUsers: 10,
    inactiveUsers: 2,
    totalRoles: 4,
    systemRoles: 3,
    customRoles: 1,
    activeRoles: 4,
    totalPermissions: 28,
  },
  usersByRole: [
    { role: 'SuperAdmin', label: 'Super Admin', count: 2, percentage: 16.7, color: '#6366f1' },
    { role: 'Admin', label: 'Admin', count: 3, percentage: 25.0, color: '#3b82f6' },
    { role: 'User', label: 'User', count: 7, percentage: 58.3, color: '#10b981' },
  ],
  usersByStatus: [
    { status: 'Active', count: 10, percentage: 83.3, color: '#10b981' },
    { status: 'Inactive', count: 2, percentage: 16.7, color: '#ef4444' },
  ],
  rolesByType: [
    { type: 'System', count: 3, percentage: 75.0, color: '#8b5cf6' },
    { type: 'Custom', count: 1, percentage: 25.0, color: '#f59e0b' },
  ],
  userRegistrationTrends: [
    { month: 'Apr', year: 2026, count: 1 },
    { month: 'May', year: 2026, count: 2 },
    { month: 'Jun', year: 2026, count: 2 },
    { month: 'Jul', year: 2026, count: 3 },
    { month: 'Aug', year: 2026, count: 4 },
    { month: 'Sep', year: 2026, count: 12 },
  ],
  rolePermissionsDistribution: [
    { roleName: 'Super Admin', permissionsCount: 28, usersCount: 2 },
    { roleName: 'Admin', permissionsCount: 22, usersCount: 3 },
    { roleName: 'User', permissionsCount: 5, usersCount: 7 },
  ],
  recentUsers: [
    {
      id: 'u-1',
      userId: 'TF0001',
      name: 'Vijayaraghavan K',
      email: 'vijay@test.com',
      role: 'SuperAdmin',
      isActive: true,
      createdAt: '2026-09-18T10:00:00.000Z',
    },
    {
      id: 'u-2',
      userId: 'TF0002',
      name: 'John Doe',
      email: 'john@test.com',
      role: 'User',
      isActive: false,
      createdAt: '2026-09-18T11:00:00.000Z',
    },
  ],
  recentRoles: [
    {
      id: 'r-1',
      roleId: 'RL0001',
      name: 'Super Admin',
      roleType: 'Super Admin',
      permissionsCount: 28,
      isSystem: true,
      isActive: true,
      createdAt: '2026-09-18T10:00:00.000Z',
    },
    {
      id: 'r-2',
      roleId: 'RL0002',
      name: 'QA Engineer',
      roleType: 'Custom',
      permissionsCount: 8,
      isSystem: false,
      isActive: true,
      createdAt: '2026-09-18T12:00:00.000Z',
    },
  ],
};

const renderWithStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      users: usersReducer,
      roles: rolesReducer,
      dashboard: dashboardReducer,
    },
  });

  return render(
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStorage.clearAuthSession();
    (dashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: mockDashboardStats,
    });
  });

  it('renders welcome banner and loads real-time dashboard data', async () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: 'usr-1',
        firstName: 'Samantha',
        lastName: 'Jones',
        email: 'samantha@example.com',
        role: 'Admin',
      })
    );

    renderWithStore();

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Samantha!')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Active Accounts')).toBeInTheDocument();
    expect(screen.getByText('Security Roles')).toBeInTheDocument();
    expect(screen.getByText('System Permissions')).toBeInTheDocument();
  });

  it('allows toggling between Pie Chart views (By Role vs By Status)', async () => {
    renderWithStore();

    await waitFor(() => {
      expect(screen.getByText('User Distribution')).toBeInTheDocument();
    });

    // Default is By Role
    expect(screen.getAllByText('Super Admin').length).toBeGreaterThan(0);

    // Toggle to By Status
    const byStatusBtn = screen.getByRole('button', { name: 'By Status' });
    fireEvent.click(byStatusBtn);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('allows toggling between Bar Chart views (Registrations vs Role Permissions)', async () => {
    renderWithStore();

    await waitFor(() => {
      expect(screen.getByText('Workspace Activity & Trends')).toBeInTheDocument();
    });

    // Default is Registrations
    expect(screen.getByText('Sep')).toBeInTheDocument();

    // Switch to Role Permissions
    const rolePermissionsBtn = screen.getByRole('button', { name: 'Role Permissions' });
    fireEvent.click(rolePermissionsBtn);

    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByText('Assigned Users')).toBeInTheDocument();
  });

  it('renders recent members and recent roles lists', async () => {
    renderWithStore();

    await waitFor(() => {
      expect(screen.getByText('Vijayaraghavan K')).toBeInTheDocument();
      expect(screen.getByText('QA Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('vijay@test.com')).toBeInTheDocument();
    expect(screen.getByText('8 permissions enabled')).toBeInTheDocument();
  });

  it('handles refresh action click', async () => {
    renderWithStore();

    await waitFor(() => {
      expect(screen.getByText('Refresh Data')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /refresh data/i });
    fireEvent.click(refreshBtn);

    expect(dashboardService.getDashboardStats).toHaveBeenCalled();
  });

  it('renders error state and allows refreshing data', async () => {
    (dashboardService.getDashboardStats as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    renderWithStore();

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /refresh data/i });
    fireEvent.click(refreshBtn);

    expect(dashboardService.getDashboardStats).toHaveBeenCalledTimes(2);
  });
});
