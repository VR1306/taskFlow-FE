import { renderHook } from '@testing-library/react';
import {
  hasPermission,
  usePermission,
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

    it('returns true for SuperAdmin role unconditionally', () => {
      const superAdminUser: AuthUser = {
        id: '1',
        email: 'super@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SuperAdmin',
        permissions: [],
      };
      expect(hasPermission(superAdminUser, 'any.permission')).toBe(true);

      const superAdminSpaced: AuthUser = {
        ...superAdminUser,
        role: 'Super Admin',
      };
      expect(hasPermission(superAdminSpaced, 'any.permission')).toBe(true);
    });

    it('returns true if user has universal wildcard permission "*"', () => {
      const wildcardUser: AuthUser = {
        id: '2',
        email: 'wild@example.com',
        firstName: 'Wild',
        lastName: 'Card',
        role: 'Manager',
        permissions: ['*'],
      };
      expect(hasPermission(wildcardUser, 'tasks.delete')).toBe(true);
    });

    it('returns true for Admin role by default', () => {
      const adminUser: AuthUser = {
        id: '3',
        email: 'admin@example.com',
        firstName: 'System',
        lastName: 'Admin',
        role: 'Admin',
        permissions: [],
      };
      expect(hasPermission(adminUser, 'users.create')).toBe(true);
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
    it('returns purple for SuperAdmin / Super Admin', () => {
      expect(getRoleTypeBadgeVariant('SuperAdmin')).toBe('purple');
      expect(getRoleTypeBadgeVariant('Super Admin')).toBe('purple');
    });

    it('returns primary for Admin', () => {
      expect(getRoleTypeBadgeVariant('Admin')).toBe('primary');
    });

    it('returns warning for Manager', () => {
      expect(getRoleTypeBadgeVariant('Manager')).toBe('warning');
    });

    it('returns success for User', () => {
      expect(getRoleTypeBadgeVariant('User')).toBe('success');
    });

    it('returns default for Guest', () => {
      expect(getRoleTypeBadgeVariant('Guest')).toBe('default');
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
