import { AuthUser } from '@/types';
import { BadgeVariant } from '@/components/ui';
import { useCurrentUser } from './useCurrentUser';

/**
 * Evaluates whether a user holds the required functional permission.
 * SuperAdmin accounts possess universal administrative rights (*).
 */
export const hasPermission = (
  user: Readonly<AuthUser> | null | undefined,
  requiredPermission: string | string[]
): boolean => {
  if (!user) return false;

  const role = user.role?.trim();
  if (role === 'SuperAdmin' || role === 'Super Admin') {
    return true;
  }

  const userPermissions = user.permissions || [];
  if (userPermissions.includes('*')) {
    return true;
  }

  if (role === 'Admin') {
    // Admin has default access to user/role/task management unless restricted
    return true;
  }

  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some((perm) => userPermissions.includes(perm));
  }

  return userPermissions.includes(requiredPermission);
};

/**
 * Hydration-safe React hook to check permissions of current logged-in user
 */
export const usePermission = (requiredPermission: string | string[]): boolean => {
  const currentUser = useCurrentUser();
  return hasPermission(currentUser, requiredPermission);
};

/**
 * Maps role classification type to badge variant
 */
export const getRoleTypeBadgeVariant = (roleType?: string): BadgeVariant => {
  switch (roleType?.trim()) {
    case 'Super Admin':
    case 'SuperAdmin':
      return 'purple';
    case 'Admin':
      return 'primary';
    case 'Manager':
      return 'warning';
    case 'User':
      return 'success';
    case 'Guest':
      return 'default';
    case 'Custom':
    default:
      return 'primary';
  }
};

/**
 * Maps functional permission action to badge color
 */
export const getActionBadgeVariant = (action?: string): BadgeVariant => {
  switch (action?.toLowerCase()) {
    case 'read':
    case 'view':
      return 'default';
    case 'create':
      return 'success';
    case 'update':
    case 'edit':
      return 'warning';
    case 'delete':
      return 'danger';
    case 'export':
      return 'purple';
    default:
      return 'primary';
  }
};
