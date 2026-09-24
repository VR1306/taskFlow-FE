import React from 'react';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  DynamicPermissionsSelector,
  RoleActionsMenu,
  CreateRoleDrawer,
  EditRoleDrawer,
  ViewRoleDrawer,
  RoleFilterDrawer,
} from './index';
import { validateRoleName } from './RoleFormFields';
import { NOOP_PERM_CHANGE } from './ViewRoleDrawer';
import { useRoleForm } from './useRoleForm';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import rolesReducer from '@/store/slices/rolesSlice';
import { RoleRecord, PermissionModule } from '@/types';
import { rolesService } from '@/services';
import { ROLES_CONSTANTS } from '@/constants';

jest.mock('@/services');

const mockPermissionsCatalogue: PermissionModule[] = [
  {
    moduleKey: 'users',
    moduleName: 'User Management',
    description: 'Manage user accounts and membership',
    permissions: [
      {
        id: 'users.view',
        name: 'View Users',
        description: 'Can view user directory and profiles',
        action: 'read',
      },
      {
        id: 'users.create',
        name: 'Create Users',
        description: 'Can onboard new users',
        action: 'create',
      },
      {
        id: 'users.delete',
        name: 'Delete Users',
        description: 'Can remove user accounts',
        action: 'delete',
      },
    ],
  },
  {
    moduleKey: 'roles',
    moduleName: 'Role Management',
    description: 'Manage system roles and permissions',
    permissions: [
      {
        id: 'roles.view',
        name: 'View Roles',
        description: 'Can view system roles',
        action: 'read',
      },
      {
        id: 'roles.create',
        name: 'Create Roles',
        description: 'Can create new roles',
        action: 'create',
      },
    ],
  },
];

const mockRole: RoleRecord = {
  _id: 'rol-101',
  roleId: 'RL0001',
  name: 'Project Manager',
  description: 'Oversees development sprint cycles',
  roleType: 'Custom',
  permissions: ['users.view', 'roles.view'],
  isActive: true,
  isSystem: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockSystemRole: RoleRecord = {
  _id: 'rol-000',
  roleId: 'RL0000',
  name: 'Taskflow Admin',
  description: 'Master system administrator',
  roleType: 'Taskflow Admin',
  permissions: ['*'],
  isActive: true,
  isSystem: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

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
          id: 'adm-1',
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
      },
      roles: {
        cachedPages: {},
        permissionsCatalogue: mockPermissionsCatalogue,
        currentPage: 1,
        limit: 10,
        search: '',
        filters: {},
        totalItems: 1,
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

describe('Role Components Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('DynamicPermissionsSelector Component', () => {
    it('renders module groups and handles individual permission checkboxes', () => {
      const onChange = jest.fn();
      render(
        <DynamicPermissionsSelector
          permissionsCatalogue={mockPermissionsCatalogue}
          selectedPermissions={['users.view']}
          onChange={onChange}
        />
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Role Management')).toBeInTheDocument();
      expect(screen.getByText('View Users')).toBeInTheDocument();

      // Check the users.create checkbox
      const createCheckbox = screen.getByRole('checkbox', { name: /create users/i });
      fireEvent.click(createCheckbox);
      expect(onChange).toHaveBeenCalledWith(['users.view', 'users.create']);
    });

    it('handles module Select All and Deselect All', () => {
      const onChange = jest.fn();
      render(
        <DynamicPermissionsSelector
          permissionsCatalogue={mockPermissionsCatalogue}
          selectedPermissions={['users.view']}
          onChange={onChange}
        />
      );

      // Select all for User Management
      const selectAllUsersCheckbox = screen.getByRole('checkbox', {
        name: /select all user management/i,
      });
      fireEvent.click(selectAllUsersCheckbox);
      expect(onChange).toHaveBeenCalledWith(['users.view', 'users.create', 'users.delete']);
    });

    it('handles global Select All and Deselect All', () => {
      const onChange = jest.fn();
      render(
        <DynamicPermissionsSelector
          permissionsCatalogue={mockPermissionsCatalogue}
          selectedPermissions={['users.view']}
          onChange={onChange}
        />
      );

      // Global Select All
      const globalSelectAllBtn = screen.getByRole('button', { name: /select all permissions/i });
      fireEvent.click(globalSelectAllBtn);
      expect(onChange).toHaveBeenCalledWith([
        'users.view',
        'users.create',
        'users.delete',
        'roles.view',
        'roles.create',
      ]);
    });

    it('renders empty catalogue gracefully', () => {
      render(
        <DynamicPermissionsSelector
          permissionsCatalogue={[]}
          selectedPermissions={[]}
          onChange={jest.fn()}
        />
      );
      expect(
        screen.getByText('No permissions catalogue available from server.')
      ).toBeInTheDocument();
    });
  });

  describe('RoleActionsMenu Component', () => {
    it('toggles menu open/close and executes actions', () => {
      localStorage.setItem(
        'taskflow_user',
        JSON.stringify({ role: 'Taskflow Admin', permissions: ['*'] })
      );

      const handleView = jest.fn();
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <RoleActionsMenu
          role={mockRole}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );

      const triggerBtn = screen.getByRole('button', { name: /actions for project manager/i });
      fireEvent.click(triggerBtn);

      const viewBtn = screen.getByRole('menuitem', { name: /view details/i });
      fireEvent.click(viewBtn);
      expect(handleView).toHaveBeenCalledWith(mockRole);

      // Re-open and click Edit
      fireEvent.click(triggerBtn);
      const editBtn = screen.getByRole('menuitem', { name: /edit role/i });
      fireEvent.click(editBtn);
      expect(handleEdit).toHaveBeenCalledWith(mockRole);

      // Re-open and click Delete
      fireEvent.click(triggerBtn);
      const deleteBtn = screen.getByRole('menuitem', { name: /delete role/i });
      fireEvent.click(deleteBtn);
      expect(handleDelete).toHaveBeenCalledWith(mockRole);
    });

    it('hides edit and delete for system roles', () => {
      localStorage.setItem(
        'taskflow_user',
        JSON.stringify({ role: 'Taskflow Admin', permissions: ['*'] })
      );

      render(
        <RoleActionsMenu
          role={mockSystemRole}
          onView={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      const triggerBtn = screen.getByRole('button', { name: /actions for taskflow admin/i });
      fireEvent.click(triggerBtn);

      expect(screen.getByRole('menuitem', { name: /view details/i })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /edit role/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /delete role/i })).not.toBeInTheDocument();
    });
  });

  describe('CreateRoleDrawer Component', () => {
    it('validates required fields and creates a role', async () => {
      const store = createMockStore();
      const handleSuccess = jest.fn();
      const handleClose = jest.fn();

      (rolesService.createRole as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          ...mockRole,
          name: 'Quality Lead',
        },
      });

      render(
        <Provider store={store}>
          <CreateRoleDrawer isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />
        </Provider>
      );

      expect(screen.getByText('Create New Role')).toBeInTheDocument();

      // Submit empty form to trigger validation
      const submitBtn = screen.getByRole('button', { name: /create role/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('Role name is required.')).toBeInTheDocument();

      // Fill in fields
      fireEvent.change(screen.getByLabelText(/role name/i), {
        target: { value: 'Quality Lead' },
      });
      fireEvent.change(screen.getByLabelText(/role description/i), {
        target: { value: 'Quality and compliance' },
      });

      // Select a permission
      const createPerm = screen.getByRole('checkbox', { name: /create users/i });
      fireEvent.click(createPerm);

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('handles api rejection and error catch gracefully', async () => {
      const store = createMockStore();
      const handleClose = jest.fn();

      (rolesService.createRole as jest.Mock).mockRejectedValueOnce(
        new Error('Role name already exists')
      );

      render(
        <Provider store={store}>
          <CreateRoleDrawer isOpen={true} onClose={handleClose} />
        </Provider>
      );

      fireEvent.change(screen.getByLabelText(/role name/i), {
        target: { value: 'Duplicate Role' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));

      expect(await screen.findByText('Role name already exists')).toBeInTheDocument();

      // Test non-error rejection fallback
      (rolesService.createRole as jest.Mock).mockRejectedValueOnce('Network error');
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));
      expect(await screen.findByText('Failed to create role.')).toBeInTheDocument();
    });
  });

  describe('EditRoleDrawer Component', () => {
    it('populates initial role data and updates role', async () => {
      const store = createMockStore();
      const handleSuccess = jest.fn();
      const handleClose = jest.fn();

      (rolesService.updateRole as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          ...mockRole,
          description: 'Updated description for PM',
        },
      });

      render(
        <Provider store={store}>
          <EditRoleDrawer
            isOpen={true}
            role={mockRole}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </Provider>
      );

      expect(screen.getByText('Edit Role')).toBeInTheDocument();

      const descInput = screen.getByLabelText(/role description/i);
      expect(descInput).toHaveValue('Oversees development sprint cycles');

      fireEvent.change(descInput, {
        target: { value: 'Updated description for PM' },
      });

      // Toggle active status switch
      const statusSwitch = screen.getByRole('switch');
      fireEvent.click(statusSwitch);

      const submitBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('returns early when role is null', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <EditRoleDrawer isOpen={true} role={null} onClose={jest.fn()} />
        </Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      expect(rolesService.updateRole).not.toHaveBeenCalled();
    });

    it('handles api rejection and super admin status locked state', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <EditRoleDrawer isOpen={true} role={mockSystemRole} onClose={jest.fn()} />
        </Provider>
      );

      expect(screen.getByText('Edit Role')).toBeInTheDocument();
      expect(screen.getByText('Super Admin role must always remain active')).toBeInTheDocument();

      // Error handling on reject
      (rolesService.updateRole as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      expect(await screen.findByText('Update failed')).toBeInTheDocument();

      (rolesService.updateRole as jest.Mock).mockRejectedValueOnce('raw string rejection');
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      expect(await screen.findByText('Failed to update role.')).toBeInTheDocument();
    });
  });

  describe('ViewRoleDrawer Component', () => {
    it('displays role details, metadata, and handles edit click', () => {
      const store = createMockStore();
      const handleClose = jest.fn();
      const handleEdit = jest.fn();

      render(
        <Provider store={store}>
          <ViewRoleDrawer
            isOpen={true}
            role={mockRole}
            permissionsCatalogue={mockPermissionsCatalogue}
            onClose={handleClose}
            onEdit={handleEdit}
            canEdit={true}
          />
        </Provider>
      );

      expect(screen.getByText('Role Details')).toBeInTheDocument();
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('RL0001')).toBeInTheDocument();
      expect(screen.getByText('Oversees development sprint cycles')).toBeInTheDocument();

      // Click Edit Role in footer
      const editBtn = screen.getByRole('button', { name: /edit role/i });
      fireEvent.click(editBtn);
      expect(handleClose).toHaveBeenCalled();
      expect(handleEdit).toHaveBeenCalledWith(mockRole);
    });

    it('handles null role, missing propCatalogue, and inactive role with fallback fields', () => {
      const store = createMockStore();
      const { rerender } = render(
        <Provider store={store}>
          <ViewRoleDrawer isOpen={true} role={null} onClose={jest.fn()} />
        </Provider>
      );
      expect(screen.queryByText('Role Details')).not.toBeInTheDocument();

      const inactiveRole: RoleRecord = {
        _id: 'rol-fallback',
        roleId: 'ROL-999',
        roleType: 'Custom',
        isSystem: false,
        roleName: 'Inactive Fallback',
        roleDescription: 'Inactive description',
        rolePermissions: ['users.view'],
        isActive: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      rerender(
        <Provider store={store}>
          <ViewRoleDrawer isOpen={true} role={inactiveRole} onClose={jest.fn()} />
        </Provider>
      );

      expect(screen.getByText('Inactive Fallback')).toBeInTheDocument();
      expect(screen.getByText('Inactive description')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('RoleFilterDrawer Component', () => {
    it('handles filter selection, select changes, apply, and reset', () => {
      const handleApply = jest.fn();
      const handleClose = jest.fn();
      const handleReset = jest.fn();

      render(
        <RoleFilterDrawer
          isOpen={true}
          onClose={handleClose}
          onApply={handleApply}
          onReset={handleReset}
          currentFilters={{ roleType: 'Custom', status: 'active' }}
        />
      );

      expect(screen.getByText('Filter Roles')).toBeInTheDocument();

      // Change selects using react-select dummy input / key navigation
      const selects = screen.getAllByRole('combobox');
      if (selects.length > 0) {
        fireEvent.change(selects[0], { target: { value: 'Taskflow Admin' } });
      }

      // Apply button
      const applyBtn = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyBtn);
      expect(handleApply).toHaveBeenCalled();

      // Reset filters button
      const resetBtn = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalled();
    });

    it('renders with undefined currentFilters', () => {
      render(
        <RoleFilterDrawer
          isOpen={true}
          onClose={jest.fn()}
          onApply={jest.fn()}
          onReset={jest.fn()}
        />
      );
      expect(screen.getByText('Filter Roles')).toBeInTheDocument();
    });
  });

  describe('RoleFormFields & validateRoleName', () => {
    it('validates role names of various lengths', () => {
      expect(validateRoleName('')).toBe('Role name is required.');
      expect(validateRoleName('   ')).toBe('Role name is required.');
      expect(validateRoleName('A')).toBe('Role name must be at least 2 characters long.');
      expect(validateRoleName('A'.repeat(61))).toBe('Role name cannot exceed 60 characters.');
      expect(validateRoleName('Valid Role')).toBeUndefined();
    });
  });

  describe('useRoleForm hook', () => {
    it('initializes with fallback roleName, roleDescription, rolePermissions', () => {
      const store = createMockStore();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const initialRole = {
        roleName: 'Hook Manager',
        roleDescription: 'Hook description',
        rolePermissions: ['users.view'],
      } as unknown as RoleRecord;

      const { result } = renderHook(() => useRoleForm({ initialRole }), { wrapper });

      expect(result.current.name).toBe('Hook Manager');
      expect(result.current.description).toBe('Hook description');
      expect(result.current.selectedPermissions).toEqual(['users.view']);

      act(() => {
        result.current.handleNameChange('Updated Hook Name');
      });
      expect(result.current.name).toBe('Updated Hook Name');

      let formData!: ReturnType<typeof result.current.getFormData>;
      act(() => {
        formData = result.current.getFormData();
      });
      expect(formData?.name).toBe('Updated Hook Name');

      // Test validation error branch in getFormData
      act(() => {
        result.current.handleNameChange('X');
      });
      let invalidData!: ReturnType<typeof result.current.getFormData>;
      act(() => {
        invalidData = result.current.getFormData();
      });
      expect(invalidData).toBeNull();
      expect(result.current.nameError).toBe('Role name must be at least 2 characters long.');
    });
  });

  describe('RoleActionsMenu Component edge cases', () => {
    it('handles fallback names and disabled actions', () => {
      const onView = jest.fn();
      const onEdit = jest.fn();
      const onDelete = jest.fn();

      // Fallback to roleName
      const roleWithNameFallback = {
        _id: 'r-fb-1',
        roleName: 'Manager Fallback',
        isSystem: false,
      } as unknown as RoleRecord;

      const { rerender } = render(
        <RoleActionsMenu
          role={roleWithNameFallback}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
      expect(
        screen.getByRole('button', { name: /actions for manager fallback/i })
      ).toBeInTheDocument();

      // Fallback to default 'Role'
      const roleWithNoName = {
        _id: 'r-fb-2',
        isSystem: false,
      } as unknown as RoleRecord;

      rerender(
        <RoleActionsMenu
          role={roleWithNoName}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={false}
          canDelete={false}
        />
      );
      expect(screen.getByRole('button', { name: /actions for role/i })).toBeInTheDocument();

      // Open menu and test actions on a normal role
      const normalRole = {
        _id: 'r-normal',
        name: 'Regular Role',
        isSystem: false,
      } as unknown as RoleRecord;

      rerender(
        <RoleActionsMenu
          role={normalRole}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={true}
          canDelete={true}
        />
      );

      const trigger = screen.getByRole('button', { name: /actions for regular role/i });
      fireEvent.click(trigger);

      const viewItem = screen.getByText('View Details');
      fireEvent.click(viewItem);
      expect(onView).toHaveBeenCalledWith(normalRole);

      fireEvent.click(trigger);
      const editItem = screen.getByText('Edit Role');
      fireEvent.click(editItem);
      expect(onEdit).toHaveBeenCalledWith(normalRole);

      fireEvent.click(trigger);
      const deleteItem = screen.getByText('Delete Role');
      fireEvent.click(deleteItem);
      expect(onDelete).toHaveBeenCalledWith(normalRole);
    });
  });

  describe('ViewRoleDrawer additional coverage', () => {
    it('executes NOOP_PERM_CHANGE and renders system core classification', () => {
      expect(typeof NOOP_PERM_CHANGE).toBe('function');
      NOOP_PERM_CHANGE();

      const store = createMockStore();
      render(
        <Provider store={store}>
          <ViewRoleDrawer isOpen={true} role={mockSystemRole} canEdit={false} onClose={jest.fn()} />
        </Provider>
      );

      expect(screen.getByText('System Core')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit role/i })).not.toBeInTheDocument();
    });
  });

  describe('EditRoleDrawer additional branches', () => {
    it('handles id fallback, validation failure, and undefined error payload', async () => {
      const store = createMockStore();
      const roleWithIdOnly = {
        id: 'legacy-id-123',
        name: 'Role with id',
      } as unknown as RoleRecord;

      render(
        <Provider store={store}>
          <EditRoleDrawer isOpen={true} role={roleWithIdOnly} onClose={jest.fn()} />
        </Provider>
      );

      // Trigger validation error on submit so payload is null
      const nameInput = screen.getByLabelText(/role name/i);
      fireEvent.change(nameInput, { target: { value: ' ' } });
      const submitBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitBtn);
      expect(rolesService.updateRole).not.toHaveBeenCalled();

      // Trigger update with role.id
      fireEvent.change(nameInput, { target: { value: 'Valid Edited Name' } });
      (rolesService.updateRole as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: roleWithIdOnly,
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(rolesService.updateRole).toHaveBeenCalledWith(
          'legacy-id-123',
          expect.objectContaining({ name: 'Valid Edited Name' })
        );
      });
    });

    it('handles role with roleName only, role without id, and undefined error payload', async () => {
      const store = createMockStore();
      const roleWithRoleName = {
        roleName: 'RoleName Fallback',
      } as unknown as RoleRecord;

      const { rerender } = render(
        <Provider store={store}>
          <EditRoleDrawer isOpen={true} role={roleWithRoleName} onClose={jest.fn()} />
        </Provider>
      );
      expect(screen.getByText('Edit Role')).toBeInTheDocument();

      const roleNoNameNoId = {} as unknown as RoleRecord;
      rerender(
        <Provider store={store}>
          <EditRoleDrawer isOpen={true} role={roleNoNameNoId} onClose={jest.fn()} />
        </Provider>
      );
      fireEvent.change(screen.getByLabelText(/role name/i), { target: { value: 'New Name' } });
      (rolesService.updateRole as jest.Mock).mockRejectedValueOnce(new Error(''));
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      expect(await screen.findByText(ROLES_CONSTANTS.editDrawer.defaultError)).toBeInTheDocument();
    });
  });

  describe('CreateRoleDrawer undefined error payload', () => {
    it('handles rejection with undefined error payload gracefully', async () => {
      const store = createMockStore();
      (rolesService.createRole as jest.Mock).mockRejectedValueOnce(new Error(''));

      render(
        <Provider store={store}>
          <CreateRoleDrawer isOpen={true} onClose={jest.fn()} />
        </Provider>
      );
      fireEvent.change(screen.getByLabelText(/role name/i), {
        target: { value: 'Fallback Create Role' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create role/i }));
      expect(
        await screen.findByText(ROLES_CONSTANTS.createDrawer.defaultError)
      ).toBeInTheDocument();
    });
  });

  describe('RoleFilterDrawer and ViewRoleDrawer additional fallbacks', () => {
    it('applies empty filters as undefined in RoleFilterDrawer', () => {
      const handleApply = jest.fn();
      render(
        <RoleFilterDrawer
          isOpen={true}
          onClose={jest.fn()}
          onApply={handleApply}
          onReset={jest.fn()}
          currentFilters={{}}
        />
      );
      const applyBtn = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyBtn);
      expect(handleApply).toHaveBeenCalledWith({
        roleType: undefined,
        status: undefined,
      });
    });

    it('handles minimal role without name or description or permissions in ViewRoleDrawer', () => {
      const emptyStore = configureStore({
        reducer: {
          auth: authReducer,
          ui: uiReducer,
          users: usersReducer,
          roles: rolesReducer,
        },
        preloadedState: {
          roles: {
            ...rolesReducer(undefined, { type: '@@INIT' }),
            permissionsCatalogue: undefined as unknown as PermissionModule[],
          },
        },
      });
      const minimalRole = {
        _id: 'rol-min',
      } as unknown as RoleRecord;

      render(
        <Provider store={emptyStore}>
          <ViewRoleDrawer isOpen={true} role={minimalRole} onClose={jest.fn()} />
        </Provider>
      );
      expect(screen.getByText('Role Details')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Custom Defined')).toBeInTheDocument();
    });
  });
});
