import { env } from '@/config/env';

/**
 * Strips trailing slashes from a URL string
 */
export const cleanUrl = (url?: string): string => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

/**
 * Resolves the base API URL for server-side vs browser environments
 */
export const getBaseApiUrl = (configuredUrl?: string, appUrl?: string): string => {
  const apiUrl = configuredUrl || env.API_URL || '/api/v1';
  const cleanedApiUrl = cleanUrl(apiUrl);

  if (typeof window === 'undefined' && !cleanedApiUrl.startsWith('http')) {
    const rawAppUrl = appUrl || env.APP_URL || 'http://localhost:3000';
    const cleanedAppUrl = cleanUrl(rawAppUrl);
    return `${cleanedAppUrl}${cleanedApiUrl}`;
  }

  return cleanedApiUrl;
};

/**
 * Constructs the backend proxy forwarding URL for BFF API route
 */
export const getBackendTargetUrl = (
  pathSegments: string[],
  search: string = '',
  backendBase?: string
): string => {
  const base =
    backendBase ||
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    env.BACKEND_API_URL ||
    'https://task-flow-be-eight.vercel.app/api/v1';

  const cleanBase = cleanUrl(base);
  const path = pathSegments.join('/');
  return `${cleanBase}/${path}${search}`;
};

/**
 * Resolves post-login redirection target based on query param, backend response, and fallback
 */
export const resolvePostLoginRedirect = (options: {
  redirectParam?: string | null;
  redirectUrl?: string;
  defaultModule?: string;
}): string => {
  const { redirectParam, redirectUrl, defaultModule } = options;

  // 1. Safe query redirect (e.g., from auth interceptor)
  if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('/auth')) {
    return redirectParam;
  }

  // 2. Direct redirect URL from login response
  if (redirectUrl) {
    return redirectUrl;
  }

  // 3. Module name from login response
  if (defaultModule) {
    return defaultModule.startsWith('/') ? defaultModule : `/${defaultModule}`;
  }

  // 4. Default fallback
  return '/dashboard';
};

/**
 * Returns Tailwind CSS styling classes for user role badges
 */
export const getRoleBadgeClass = (role?: string): string => {
  switch (role) {
    case 'Taskflow Admin':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Project Manager':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Developer':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'QA':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

/**
 * Generates user avatar initials from first and last names
 */
export const getUserInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim()?.[0] || 'U';
  const last = lastName?.trim()?.[0] || '';
  return `${first}${last}`.toUpperCase();
};

/**
 * Formats a duration in seconds into a mm:ss countdown display string
 */
export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const remainingSeconds = Math.max(0, seconds) % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats an ISO date string into a human-readable date (e.g., Jan 1, 2026).
 * Uses a pure deterministic implementation to avoid SSR/client hydration mismatches
 * caused by differing ICU data between Node.js and the browser.
 */
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (Number.isNaN(date.getTime())) return 'N/A';
    const month = MONTH_NAMES[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return 'N/A';
  }
};

/**
 * Formats a date into a relative time description (e.g., "Just now", "5m ago", "2h ago", "3d ago")
 */
export const formatRelativeTime = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (Number.isNaN(date.getTime())) return 'N/A';

    const now = Date.now();
    const diffSeconds = Math.floor((now - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(date);
  } catch {
    return 'N/A';
  }
};
