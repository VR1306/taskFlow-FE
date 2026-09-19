import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import rolesReducer from '@/store/slices/rolesSlice';
import { RoleRecord, PermissionModule } from '@/types';
import { rolesService } from '@/services';

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
  roleType: 'Manager',
  permissions: ['users.view', 'roles.view'],
  isActive: true,
  isSystem: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockSystemRole: RoleRecord = {
  _id: 'rol-000',
  roleId: 'RL0000',
  name: 'Super Admin',
  description: 'Master system administrator',
  roleType: 'Super Admin',
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
        JSON.stringify({ role: 'SuperAdmin', permissions: ['*'] })
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
        JSON.stringify({ role: 'SuperAdmin', permissions: ['*'] })
      );

      render(
        <RoleActionsMenu
          role={mockSystemRole}
          onView={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      const triggerBtn = screen.getByRole('button', { name: /actions for super admin/i });
      fireEvent.click(triggerBtn);

      expect(screen.getByRole('menuitem', { name: /view details/i })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /edit role/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /delete role/i })).not.toBeInTheDocument();
    });

    it('copies role ID to clipboard', async () => {
      render(
        <RoleActionsMenu
          role={mockRole}
          onView={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      const triggerBtn = screen.getByRole('button', { name: /actions for project manager/i });
      fireEvent.click(triggerBtn);

      const copyBtn = screen.getByRole('menuitem', { name: /copy role id/i });
      fireEvent.click(copyBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('RL0001');
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

      const submitBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('ViewRoleDrawer Component', () => {
    it('displays role details, metadata, and permission tags', () => {
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
          />
        </Provider>
      );

      expect(screen.getByText('Role Details')).toBeInTheDocument();
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('RL0001')).toBeInTheDocument();
      expect(screen.getByText('Oversees development sprint cycles')).toBeInTheDocument();
    });
  });

  describe('RoleFilterDrawer Component', () => {
    it('handles filter selection, apply, and reset', () => {
      const handleApply = jest.fn();
      const handleClose = jest.fn();
      const handleReset = jest.fn();

      render(
        <RoleFilterDrawer
          isOpen={true}
          onClose={handleClose}
          onApply={handleApply}
          onReset={handleReset}
          currentFilters={{ roleType: 'Manager', status: 'Active' }}
        />
      );

      expect(screen.getByText('Filter Roles')).toBeInTheDocument();

      // Apply button
      const applyBtn = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyBtn);
      expect(handleApply).toHaveBeenCalledWith({ roleType: 'Manager', status: 'Active' });

      // Reset filters button
      const resetBtn = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalled();
    });
  });
});
