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
    roleType: 'Taskflow Admin',
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
    roleType: 'Custom',
    permissions: ['users.view', 'roles.view'],
    isActive: true,
    isSystem: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rol-003',
    roleName: 'QA Tester',
    roleDescription: 'Quality testing',
    roleType: 'Developer',
    rolePermissions: ['tasks.view'],
    isActive: false,
    isSystem: false,
  } as unknown as RoleRecord,
  {
    _id: 'rol-004-mongo',
    name: 'Mongo Role',
    permissions: [],
  } as unknown as RoleRecord,
  {
    name: 'Fallback Role',
    permissions: [],
  } as unknown as RoleRecord,
  {
    roleName: '',
  } as unknown as RoleRecord,
];

const createMockStore = (overrides?: {
  auth?: Partial<ReturnType<typeof authReducer>>;
  roles?: Partial<ReturnType<typeof rolesReducer>>;
}) => {
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
          role: 'Taskflow Admin',
          permissions: ['*'],
        },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
        ...overrides?.auth,
      },
      roles: {
        cachedPages: {
          '1-10---': {
            data: mockRoles,
            pagination: {
              totalItems: mockRoles.length,
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
        totalItems: mockRoles.length,
        totalPages: 1,
        isLoading: false,
        isPermissionsLoading: false,
        isActionLoading: false,
        error: null,
        ttlMs: 120000,
        ...overrides?.roles,
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
      JSON.stringify({ role: 'Taskflow Admin', permissions: ['*'] })
    );

    (rolesService.getPermissionsCatalogue as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPermissionsCatalogue,
    });

    (rolesService.getRoles as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: mockRoles.length,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: mockRoles,
    });

    (rolesService.deleteRole as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Role deleted',
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
      expect(screen.getByText(`All Roles (${mockRoles.length})`)).toBeInTheDocument();
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
    const store = createMockStore({
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
        totalItems: 0,
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

  it('renders tooltips for role name, description, and permissions with ellipses', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
    });

    // Check description with ellipsis line clamp
    const descriptionElement = screen.getByText('Oversees development sprint cycles');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveClass('line-clamp-1');
    expect(descriptionElement).toHaveClass('truncate');

    // Hover over description to trigger tooltip
    fireEvent.mouseEnter(descriptionElement);
    const tooltips = screen.getAllByRole('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
    const matchingDescriptions = screen.getAllByText('Oversees development sprint cycles');
    expect(matchingDescriptions).toHaveLength(2);

    // Hover over permissions count badge
    const permBadge = screen.getByText('2 granted');
    fireEvent.mouseEnter(permBadge);
    expect(screen.getByText('Granted permissions (2): users.view, roles.view')).toBeInTheDocument();
  });

  it('handles CSV and JSON exports including all formatters and column accessors', async () => {
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();
    const clickMock = jest.fn();
    const origCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const el = origCreateElement(tagName) as HTMLAnchorElement;
        el.click = clickMock;
        return el;
      }
      return origCreateElement(tagName);
    });

    (rolesService.getRoles as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockRoles,
      pagination: { totalItems: mockRoles.length, totalPages: 1, currentPage: 1, limit: 100 },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export options/i })).toBeInTheDocument();
    });

    // Open export menu
    fireEvent.click(screen.getByRole('button', { name: /export options/i }));
    // Click CSV export
    fireEvent.click(screen.getByText('Export as CSV (.csv)'));

    await waitFor(() => {
      expect(clickMock).toHaveBeenCalled();
    });

    // Test JSON export
    (rolesService.getRoles as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockRoles,
      pagination: { totalItems: mockRoles.length, totalPages: 1, currentPage: 1, limit: 100 },
    });

    fireEvent.click(screen.getByRole('button', { name: /export options/i }));
    fireEvent.click(screen.getByText('Export as JSON (.json)'));

    await waitFor(() => {
      expect(clickMock).toHaveBeenCalledTimes(2);
    });

    jest.restoreAllMocks();
  });

  it('opens ViewRoleDrawer on Role ID and Role Name click, and handles edit from drawer', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
    });

    // Click Role ID link to open ViewRoleDrawer
    const idButton = screen.getByRole('button', { name: 'RL0002' });
    fireEvent.click(idButton);
    expect(screen.getByText('Role Details')).toBeInTheDocument();

    // Click Close in ViewRoleDrawer
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByText('Role Details')).not.toBeInTheDocument();
    });

    // Click Role Name button to open ViewRoleDrawer
    const nameButton = screen.getByRole('button', { name: 'Project Manager' });
    fireEvent.click(nameButton);
    expect(screen.getByText('Role Details')).toBeInTheDocument();

    // Click Edit Role inside ViewRoleDrawer (triggers onEdit callback)
    const editFromViewBtn = screen.getByRole('button', { name: /edit role/i });
    fireEvent.click(editFromViewBtn);

    // EditRoleDrawer opens
    expect(screen.getByText('Edit Role')).toBeInTheDocument();

    // Click Cancel in EditRoleDrawer
    const cancelEditBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelEditBtn);
    await waitFor(() => {
      expect(screen.queryByText('Edit Role')).not.toBeInTheDocument();
    });

    // Open EditRoleDrawer via table row ActionsMenu
    const actionsBtn = screen.getByRole('button', { name: /actions for project manager/i });
    fireEvent.click(actionsBtn);
    const editMenuItem = screen.getByRole('menuitem', { name: /edit role/i });
    fireEvent.click(editMenuItem);
    expect(screen.getByText('Edit Role')).toBeInTheDocument();

    // Submit edit successfully to test EditRoleDrawer.onSuccess
    (rolesService.updateRole as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockRoles[1],
    });
    const saveChangesBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveChangesBtn);
    await waitFor(() => {
      expect(screen.queryByText('Edit Role')).not.toBeInTheDocument();
    });
  });

  it('handles CreateRoleDrawer success callback and delete modal cancel', async () => {
    (rolesService.createRole as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockRoles[1],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Role' })).toBeInTheDocument();
    });

    // Open create drawer
    fireEvent.click(screen.getByRole('button', { name: 'Create Role' }));
    expect(screen.getByText('Create New Role')).toBeInTheDocument();

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/role name/i), { target: { value: 'New Test Role' } });
    const submitBtn = screen.getAllByRole('button', { name: /create role/i })[1];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByText('Create New Role')).not.toBeInTheDocument();
    });

    // Test delete modal cancel
    const actionsBtn = screen.getByRole('button', { name: /actions for project manager/i });
    fireEvent.click(actionsBtn);
    fireEvent.click(screen.getByRole('menuitem', { name: /delete role/i }));
    expect(screen.getByRole('heading', { name: 'Delete Role' })).toBeInTheDocument();

    const cancelDeleteBtn = screen.getByRole('button', { name: 'Keep Role' });
    fireEvent.click(cancelDeleteBtn);
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Delete Role' })).not.toBeInTheDocument();
    });
  });

  it('handles active filter chips removal and reset', async () => {
    const store = createMockStore({
      roles: {
        cachedPages: {},
        filters: { roleType: 'Custom', status: 'active' },
        totalItems: 0,
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
      expect(screen.getByText('Type: Custom')).toBeInTheDocument();
      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    // Remove status chip first
    const removeStatusBtn = screen.getByRole('button', { name: /remove status filter/i });
    fireEvent.click(removeStatusBtn);

    // Reset All button is still visible because roleType filter is still active
    const resetAllBtn = screen.getByRole('button', { name: /reset all/i });
    fireEvent.click(resetAllBtn);
  });

  it('renders unauthorized state when user lacks roles.view permission', async () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: 'user-no-role-perm',
        email: 'user@taskflow.dev',
        firstName: 'No',
        lastName: 'Access',
        role: 'Developer',
        permissions: ['projects.view'],
      })
    );

    const store = createMockStore({
      auth: {
        user: {
          id: 'user-no-role-perm',
          email: 'user@taskflow.dev',
          firstName: 'No',
          lastName: 'Access',
          role: 'Developer',
          permissions: ['projects.view'],
        },
      },
      roles: {
        cachedPages: {},
        permissionsCatalogue: [],
        totalItems: 0,
      },
    });

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText(
          'You do not have permission to view or manage organizational roles. Please contact a workspace administrator.'
        )
      ).toBeInTheDocument();
    });
  });

  it('handles page change from pagination controls', async () => {
    const store = createMockStore({
      roles: {
        cachedPages: {
          '1-10---': {
            data: mockRoles,
            pagination: {
              totalItems: 25,
              totalPages: 3,
              currentPage: 1,
              limit: 10,
              hasNextPage: true,
              hasPrevPage: false,
            },
            timestamp: Date.now(),
          },
        },
        totalItems: 25,
        totalPages: 3,
      },
    });

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    const nextBtn = screen.getByRole('button', { name: /next page/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(rolesService.getRoles).toHaveBeenCalled();
  });

  it('handles limit change from pagination controls', async () => {
    const store = createMockStore({
      roles: {
        cachedPages: {
          '1-10---': {
            data: mockRoles,
            pagination: {
              totalItems: 25,
              totalPages: 3,
              currentPage: 1,
              limit: 10,
              hasNextPage: true,
              hasPrevPage: false,
            },
            timestamp: Date.now(),
          },
        },
        totalItems: 25,
        totalPages: 3,
      },
    });

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    const limitSelect = screen.getByLabelText(/rows per page/i);
    fireEvent.change(limitSelect, { target: { value: '20' } });
    expect(limitSelect).toHaveValue('20');
  });

  it('clears search input when clear icon is clicked', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText(/search by role name/i);
    fireEvent.change(searchInput, { target: { value: 'Developer' } });

    const clearSearchBtn = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearSearchBtn);
    expect(searchInput).toHaveValue('');
  });

  it('handles empty state actions for filtered view and default view', async () => {
    // 1. With filters active: clicking "Clear Search & Filters"
    const storeWithFilter = createMockStore({
      roles: {
        cachedPages: {
          '1-10--Developer-inactive': {
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
        filters: { roleType: 'Developer', status: 'inactive' },
        totalItems: 0,
      },
    });

    const { unmount } = render(
      <Provider store={storeWithFilter}>
        <RolesPage />
      </Provider>
    );

    expect(screen.getByText('Status: Inactive')).toBeInTheDocument();
    // Test removing role type filter chip specifically (covers line 319)
    const removeRoleTypeBtn = screen.getByRole('button', { name: /remove role type filter/i });
    fireEvent.click(removeRoleTypeBtn);

    // Test clicking Clear Search & Filters in empty action
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear search & filters/i })).toBeInTheDocument();
    });
    const clearBtn = screen.getByRole('button', { name: /clear search & filters/i });
    fireEvent.click(clearBtn);
    unmount();

    // 2. Default empty state with canCreateRole: clicking "Create Role" emptyAction
    const storeEmpty = createMockStore({
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
        totalItems: 0,
      },
    });

    render(
      <Provider store={storeEmpty}>
        <RolesPage />
      </Provider>
    );

    // EmptyAction create button (last create role button on the page)
    const emptyCreateBtns = screen.getAllByRole('button', { name: /create role/i });
    fireEvent.click(emptyCreateBtns[emptyCreateBtns.length - 1]);
    expect(screen.getByText('Create New Role')).toBeInTheDocument();
  });

  it('renders read-only view when user has only roles.view permission', async () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: 'viewer-1',
        email: 'viewer@taskflow.dev',
        firstName: 'Viewer',
        lastName: 'Only',
        role: 'Viewer',
        permissions: ['roles.view'],
      })
    );

    const store = createMockStore({
      auth: {
        user: {
          id: 'viewer-1',
          email: 'viewer@taskflow.dev',
          firstName: 'Viewer',
          lastName: 'Only',
          role: 'Viewer',
          permissions: ['roles.view'],
        },
      },
    });

    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    // In read-only mode, Create Role button is NOT in header
    expect(screen.queryByRole('button', { name: /create role/i })).not.toBeInTheDocument();
  });

  it('handles delete confirmation for role with roleName', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    // Delete QA Tester (which uses roleName instead of name)
    const actionsBtn = screen.getByRole('button', { name: /actions for qa tester/i });
    fireEvent.click(actionsBtn);
    fireEvent.click(screen.getByRole('menuitem', { name: /delete role/i }));

    expect(
      screen.getByText(/Are you sure you want to permanently delete 'QA Tester'/i)
    ).toBeInTheDocument();
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete Role' });
    fireEvent.click(confirmDeleteBtn);
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Delete Role' })).not.toBeInTheDocument();
    });
  });

  it('handles delete confirmation when role has no id or _id', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    const fallbackActionsBtn = screen.getByRole('button', { name: 'Actions for Role' });
    fireEvent.click(fallbackActionsBtn);
    const deleteItem = screen.getByRole('menuitem', { name: /delete role/i });
    fireEvent.click(deleteItem);
    const confirmBtn = screen.getByRole('button', { name: 'Delete Role' });
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);
  });

  it('handles bulk export when API returns empty or undefined data', async () => {
    (rolesService.getRoles as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: undefined,
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <RolesPage />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /export options/i }));
    fireEvent.click(screen.getByText('Export as CSV (.csv)'));
    await waitFor(() => {
      expect(rolesService.getRoles).toHaveBeenCalled();
    });
  });
});
