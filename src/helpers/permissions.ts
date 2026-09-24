import { AuthUser } from '@/types';
import { BadgeVariant } from '@/components/ui';
import { useCurrentUser } from './useCurrentUser';

/**
 * Evaluates whether a user holds the required functional permission.
 * Taskflow Admin accounts possess universal administrative rights (*).
 */
export const hasPermission = (
  user: Readonly<AuthUser> | null | undefined,
  requiredPermission: string | string[]
): boolean => {
  if (!user) return false;

  const role = user.role?.trim();
  if (role === 'Taskflow Admin') {
    return true;
  }

  const userPermissions = user.permissions || [];
  if (userPermissions.includes('*')) {
    return true;
  }

  const requested = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

  if (role === 'Project Manager') {
    // Project Manager has default operational access to team, tasks, and reporting
    const projectManagerDefaultPerms = new Set([
      'users.view',
      'users.create',
      'users.update',
      'roles.view',
      'tasks.view',
      'tasks.create',
      'tasks.update',
      'tasks.delete',
      'analytics.view',
      'analytics.export',
      'settings.view',
    ]);
    if (
      requested.some(
        (perm) => projectManagerDefaultPerms.has(perm) || userPermissions.includes(perm)
      )
    ) {
      return true;
    }
  }

  return requested.some((perm) => userPermissions.includes(perm));
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
    case 'Taskflow Admin':
      return 'purple';
    case 'Project Manager':
      return 'primary';
    case 'Developer':
      return 'success';
    case 'QA':
      return 'warning';
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
