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
    case 'SuperAdmin':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Admin':
      return 'bg-blue-50 text-blue-700 border-blue-200';
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
 * Formats an ISO date string into a localized human-readable date (e.g., Jan 1, 2026)
 */
export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};
