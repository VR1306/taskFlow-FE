import { renderHook } from '@testing-library/react';
import {
  hasPermission,
  usePermission,
  resolveLandingPageForUser,
  getRoleTypeBadgeVariant,
  getActionBadgeVariant,
} from './permissions';
import { AuthUser } from '@/types';

describe('Permissions Helper & Hooks', () => {
  describe('hasPermission()', () => {
    it('returns false for null or undefined user', () => {
      expect(hasPermission(null, 'users.view')).toBe(false);
      expect(hasPermission(undefined, 'users.view')).toBe(false);
    });

    it('returns true for Taskflow Admin role unconditionally', () => {
      const taskflowAdminUser: AuthUser = {
        id: '1',
        email: 'super@example.com',
        firstName: 'Taskflow',
        lastName: 'Admin',
        role: 'Taskflow Admin',
        permissions: [],
      };
      expect(hasPermission(taskflowAdminUser, 'any.permission')).toBe(true);
    });

    it('returns true if user has universal wildcard permission "*"', () => {
      const wildcardUser: AuthUser = {
        id: '2',
        email: 'wild@example.com',
        firstName: 'Wild',
        lastName: 'Card',
        role: 'Developer',
        permissions: ['*'],
      };
      expect(hasPermission(wildcardUser, 'tasks.delete')).toBe(true);
    });

    it('checks Project Manager permissions from the granted list, same as any other non-admin role', () => {
      const projectManagerUser: AuthUser = {
        id: '3',
        email: 'pm@example.com',
        firstName: 'Project',
        lastName: 'Manager',
        role: 'Project Manager',
        permissions: ['users.create', 'projects.view'],
      };
      expect(hasPermission(projectManagerUser, 'users.create')).toBe(true);
      expect(hasPermission(projectManagerUser, 'projects.view')).toBe(true);
      expect(hasPermission(projectManagerUser, 'roles.delete')).toBe(false);
    });

    it('does not grant Project Manager any permission by default when the server sends none', () => {
      const projectManagerUser: AuthUser = {
        id: '3b',
        email: 'pm-empty@example.com',
        firstName: 'Project',
        lastName: 'Manager',
        role: 'Project Manager',
        permissions: [],
      };
      expect(hasPermission(projectManagerUser, 'users.create')).toBe(false);
    });

    it('checks specific single permission string for custom user', () => {
      const customUser: AuthUser = {
        id: '4',
        email: 'custom@example.com',
        firstName: 'Custom',
        lastName: 'User',
        role: 'Custom',
        permissions: ['users.view', 'roles.view'],
      };
      expect(hasPermission(customUser, 'users.view')).toBe(true);
      expect(hasPermission(customUser, 'roles.view')).toBe(true);
      expect(hasPermission(customUser, 'users.delete')).toBe(false);
    });

    it('checks array of permissions (returns true if ANY matches)', () => {
      const customUser: AuthUser = {
        id: '5',
        email: 'custom@example.com',
        firstName: 'Custom',
        lastName: 'User',
        role: 'Custom',
        permissions: ['users.view'],
      };
      expect(hasPermission(customUser, ['users.edit', 'users.view'])).toBe(true);
      expect(hasPermission(customUser, ['users.create', 'users.delete'])).toBe(false);
    });

    it('treats a missing permissions array as empty for a non-admin user', () => {
      const userWithoutPermissions: AuthUser = {
        id: '6',
        email: 'noperm@example.com',
        firstName: 'No',
        lastName: 'Perm',
        role: 'Custom',
      };
      expect(hasPermission(userWithoutPermissions, 'users.view')).toBe(false);
    });

    it('allows Project Manager to use any explicitly granted permission', () => {
      const projectManagerWithExtra: AuthUser = {
        id: '7',
        email: 'pm2@example.com',
        firstName: 'PM',
        lastName: 'Two',
        role: 'Project Manager',
        permissions: ['custom.special'],
      };
      expect(hasPermission(projectManagerWithExtra, 'custom.special')).toBe(true);
      expect(hasPermission(projectManagerWithExtra, 'another.missing')).toBe(false);
    });
  });

  describe('resolveLandingPageForUser()', () => {
    it('lands a QA-style user (projects.view only) on Projects, not Dashboard', () => {
      const qaUser: AuthUser = {
        id: '10',
        email: 'qa@example.com',
        firstName: 'Rithika',
        lastName: 'Suresh',
        role: 'QA',
        permissions: ['projects.view', 'tasks.view', 'tasks.create', 'tasks.edit'],
      };
      expect(resolveLandingPageForUser(qaUser)).toBe('/projects');
    });

    it('lands a user with only users.view on User Management, skipping Projects which comes first in NAV_ITEMS', () => {
      const usersOnlyUser: AuthUser = {
        id: '11',
        email: 'staff@example.com',
        firstName: 'Staff',
        lastName: 'Member',
        role: 'Custom',
        permissions: ['users.view'],
      };
      expect(resolveLandingPageForUser(usersOnlyUser)).toBe('/users');
    });

    it('falls back to /dashboard for a user with no permission-gated module access', () => {
      const noModuleAccessUser: AuthUser = {
        id: '12',
        email: 'none@example.com',
        firstName: 'No',
        lastName: 'Access',
        role: 'Custom',
        permissions: [],
      };
      expect(resolveLandingPageForUser(noModuleAccessUser)).toBe('/dashboard');
    });

    it('lands Taskflow Admin on the first gated module (Projects), not Dashboard, since hasPermission grants Admins everything', () => {
      const adminUser: AuthUser = {
        id: '13',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Taskflow Admin',
      };
      expect(resolveLandingPageForUser(adminUser)).toBe('/projects');
    });

    it('falls back to /dashboard for a null/undefined user', () => {
      expect(resolveLandingPageForUser(null)).toBe('/dashboard');
      expect(resolveLandingPageForUser(undefined)).toBe('/dashboard');
    });
  });

  describe('usePermission() hook', () => {
    beforeEach(() => {
      localStorage.clear();
      jest.restoreAllMocks();
    });

    it('returns false when no user is logged in', () => {
      const { result } = renderHook(() => usePermission('users.view'));
      expect(result.current).toBe(false);
    });

    it('evaluates permission from localStorage user', () => {
      const user: AuthUser = {
        id: '123',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'Custom',
        permissions: ['roles.view', 'roles.create'],
      };
      localStorage.setItem('taskflow_user', JSON.stringify(user));

      const { result } = renderHook(() => usePermission('roles.view'));
      expect(result.current).toBe(true);

      const { result: failResult } = renderHook(() => usePermission('roles.delete'));
      expect(failResult.current).toBe(false);
    });
  });

  describe('getRoleTypeBadgeVariant()', () => {
    it('returns purple for Taskflow Admin', () => {
      expect(getRoleTypeBadgeVariant('Taskflow Admin')).toBe('purple');
    });

    it('returns primary for Project Manager', () => {
      expect(getRoleTypeBadgeVariant('Project Manager')).toBe('primary');
    });

    it('returns success for Developer', () => {
      expect(getRoleTypeBadgeVariant('Developer')).toBe('success');
    });

    it('returns warning for QA', () => {
      expect(getRoleTypeBadgeVariant('QA')).toBe('warning');
    });

    it('returns primary for Custom or fallback', () => {
      expect(getRoleTypeBadgeVariant('Custom')).toBe('primary');
      expect(getRoleTypeBadgeVariant('')).toBe('primary');
      expect(getRoleTypeBadgeVariant(undefined)).toBe('primary');
    });
  });

  describe('getActionBadgeVariant()', () => {
    it('returns appropriate badge variants for known actions', () => {
      expect(getActionBadgeVariant('read')).toBe('default');
      expect(getActionBadgeVariant('view')).toBe('default');
      expect(getActionBadgeVariant('create')).toBe('success');
      expect(getActionBadgeVariant('update')).toBe('warning');
      expect(getActionBadgeVariant('edit')).toBe('warning');
      expect(getActionBadgeVariant('delete')).toBe('danger');
      expect(getActionBadgeVariant('export')).toBe('purple');
      expect(getActionBadgeVariant('manage')).toBe('primary');
      expect(getActionBadgeVariant(undefined)).toBe('primary');
    });
  });
});
