export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  requiredPermission?: string | string[];
}

/**
 * Ordered list of top-level app modules. Order matters beyond display: it also defines
 * priority when picking a logged-in user's landing page (see resolveLandingPageForUser in
 * @/helpers/permissions) — the first item here the user has permission for is where they
 * land after login. Dashboard has no requiredPermission, so it's always a valid landing
 * page and acts as the universal fallback.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '/icons/dashboard.svg',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: '/icons/building.svg',
    requiredPermission: ['projects.view', '*'],
  },
  {
    name: 'User Management',
    href: '/users',
    icon: '/icons/users.svg',
    requiredPermission: ['users.view', '*'],
  },
  {
    name: 'Role Management',
    href: '/roles',
    icon: '/icons/shield-check.svg',
    requiredPermission: ['roles.view', '*'],
  },
];

export default NAV_ITEMS;
