import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RolesPage from './page';
import { rolesService } from '@/services';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import rolesReducer from '@/store/slices/rolesSlice';
import { RoleRecord, PermissionModule } from '@/types';

jest.mock('@/services');

const mockPermissionsCatalogue: PermissionModule[] = [
  {
    moduleKey: 'users',
    moduleName: 'User Management',
    description: 'Manage user accounts',
    permissions: [
      { id: 'users.view', name: 'View Users', description: 'Can view users', action: 'read' },
      {
        id: 'users.create',
        name: 'Create Users',
        description: 'Can create users',
        action: 'create',
      },
    ],
  },
  {
    moduleKey: 'roles',
    moduleName: 'Role Management',
    description: 'Manage roles',
    permissions: [
      { id: 'roles.view', name: 'View Roles', description: 'Can view roles', action: 'read' },
      {
        id: 'roles.create',
        name: 'Create Roles',
        description: 'Can create roles',
        action: 'create',
      },
    ],
  },
];

const mockRoles: RoleRecord[] = [
  {
    _id: 'rol-001',
    roleId: 'RL0001',
    name: 'System Administrator',
    description: 'Unrestricted master administrative access',
    roleType: 'Super Admin',
    permissions: ['*'],
    isActive: true,
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'rol-002',
    roleId: 'RL0002',
    name: 'Project Manager',
    description: 'Oversees development sprint cycles',
    roleType: 'Manager',
    permissions: ['users.view', 'roles.view'],
    isActive: true,
    isSystem: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      users: usersReducer,
      roles: rolesReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: 'admin-1',
          email: 'admin@taskflow.dev',
          firstName: 'System',
          lastName: 'Admin',
          role: 'SuperAdmin',
          permissions: ['*'],
        },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
      roles: {
        cachedPages: {
          '1-10---': {
            data: mockRoles,
            pagination: {
              totalItems: 2,
              totalPages: 1,
              currentPage: 1,
              limit: 10,
              hasNextPage: false,
              hasPrevPage: false,
            },
            timestamp: Date.now(),
          },
        },
        permissionsCatalogue: mockPermissionsCatalogue,
        currentPage: 1,
        limit: 10,
        search: '',
        filters: {},
        totalItems: 2,
        totalPages: 1,
        isLoading: false,
        isPermissionsLoading: false,
        isActionLoading: false,
        error: null,
        ttlMs: 120000,
      },
    },
  });
};

describe('RolesPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({ role: 'SuperAdmin', permissions: ['*'] })
    );

    (rolesService.getPermissionsCatalogue as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPermissionsCatalogue,
    });

    (rolesService.getRoles as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: mockRoles,
    });
  });

  it('renders role list table with RL0001 IDs and Create Role button', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Role Management')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /create role/i }).length).toBeGreaterThan(0);
      expect(screen.getByText('System Administrator')).toBeInTheDocument();
      expect(screen.getAllByText('RL0001').length).toBeGreaterThan(0);
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getAllByText('RL0002').length).toBeGreaterThan(0);
      expect(screen.getByText('All Roles (2)')).toBeInTheDocument();
    });
  });

  it('opens and closes Create Role drawer on button click', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /create role/i }).length).toBeGreaterThan(0);
    });

    const createBtn = screen.getAllByRole('button', { name: /create role/i })[0];
    fireEvent.click(createBtn);

    expect(screen.getByText('Create New Role')).toBeInTheDocument();

    // Close drawer
    const cancelBtns = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtns[0]);

    await waitFor(() => {
      expect(screen.queryByText('Create New Role')).not.toBeInTheDocument();
    });
  });

  it('opens Filter drawer and applies role filters', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /filter/i }));
    expect(screen.getByText('Filter Roles')).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(screen.queryByText('Filter Roles')).not.toBeInTheDocument();
    });
  });

  it('handles search input and triggers debounced query', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/search by role name, description, role id.../i)
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /search by role name, description, role id.../i
    );
    fireEvent.change(searchInput, { target: { value: 'Manager' } });

    await waitFor(() => {
      expect(rolesService.getRoles).toHaveBeenCalled();
    });
  });

  it('opens delete confirmation modal and calls deleteRole on confirm', async () => {
    (rolesService.deleteRole as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Role deleted successfully',
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
    });

    // Open actions menu for Project Manager
    const actionsBtn = screen.getByRole('button', { name: /actions for project manager/i });
    fireEvent.click(actionsBtn);

    const deleteBtn = screen.getByRole('menuitem', { name: /delete role/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('heading', { name: 'Delete Role' })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to permanently delete/i)).toBeInTheDocument();

    // Confirm delete
    const deleteButtons = screen.getAllByRole('button', { name: /delete role/i });
    const confirmDeleteBtn = deleteButtons[deleteButtons.length - 1];
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(rolesService.deleteRole).toHaveBeenCalledWith('rol-002');
    });
  });

  it('displays empty state when no roles match criteria', async () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
        users: usersReducer,
        roles: rolesReducer,
      },
      preloadedState: {
        auth: {
          user: {
            id: 'admin-1',
            email: 'admin@taskflow.dev',
            firstName: 'System',
            lastName: 'Admin',
            role: 'SuperAdmin',
            permissions: ['*'],
          },
          isAuthenticated: true,
          isLogoutModalOpen: false,
          isLoggingOut: false,
          isChangePasswordModalOpen: false,
          rememberMe: false,
        },
        roles: {
          cachedPages: {
            '1-10---': {
              data: [],
              pagination: {
                totalItems: 0,
                totalPages: 1,
                currentPage: 1,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false,
              },
              timestamp: Date.now(),
            },
          },
          permissionsCatalogue: mockPermissionsCatalogue,
          currentPage: 1,
          limit: 10,
          search: '',
          filters: {},
          totalItems: 0,
          totalPages: 1,
          isLoading: false,
          isPermissionsLoading: false,
          isActionLoading: false,
          error: null,
          ttlMs: 120000,
        },
      },
    });

    (rolesService.getRoles as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
      pagination: { totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 },
    });

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Roles Found')).toBeInTheDocument();
      expect(
        screen.getByText('No roles match your current search and filter criteria.')
      ).toBeInTheDocument();
    });
  });
});
