import { AuthUser } from '@/types';
import { BadgeVariant } from '@/components/ui';
import { NAV_ITEMS } from '@/constants';
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
 * Resolves the landing page for a just-logged-in (or already-authenticated) user: the
 * first permission-gated module in NAV_ITEMS — the same ordered list the sidebar uses to
 * decide what to show — that the user's role actually grants. Dashboard has no
 * requiredPermission and is deliberately excluded from this pass (it's "available" to
 * everyone, so treating it as index 0 would make every user land there regardless of
 * role); it's used only as the fallback when none of the gated modules are granted.
 */
export const resolveLandingPageForUser = (user: Readonly<AuthUser> | null | undefined): string => {
  const firstGrantedModule = NAV_ITEMS.find(
    (item) => item.requiredPermission && hasPermission(user, item.requiredPermission)
  );
  if (firstGrantedModule) return firstGrantedModule.href;

  const fallbackModule = NAV_ITEMS.find((item) => !item.requiredPermission);
  return fallbackModule?.href || '/dashboard';
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
