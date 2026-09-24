import {
  cleanUrl,
  getBaseApiUrl,
  getBackendTargetUrl,
  resolvePostLoginRedirect,
  getRoleBadgeClass,
  getUserInitials,
  formatCountdown,
  formatDate,
  formatRelativeTime,
} from './helpers';

describe('Frontend General Helpers', () => {
  describe('cleanUrl', () => {
    it('removes trailing slashes', () => {
      expect(cleanUrl('https://example.com/api/')).toBe('https://example.com/api');
      expect(cleanUrl('https://example.com/api')).toBe('https://example.com/api');
      expect(cleanUrl('')).toBe('');
      expect(cleanUrl(undefined)).toBe('');
    });
  });

  describe('getBaseApiUrl', () => {
    it('returns cleaned configured URL', () => {
      expect(getBaseApiUrl('https://api.taskflow.io/v1/')).toBe('https://api.taskflow.io/v1');
    });

    it('handles relative configured URL in browser context', () => {
      expect(getBaseApiUrl('/api/v1/')).toBe('/api/v1');
    });
  });

  describe('getBackendTargetUrl', () => {
    it('constructs backend url from segments and base url', () => {
      const url = getBackendTargetUrl(
        ['users', 'getAllUsers'],
        '?page=1',
        'https://api.taskflow.io/v1'
      );
      expect(url).toBe('https://api.taskflow.io/v1/users/getAllUsers?page=1');
    });

    it('constructs backend url with default empty search and default base', () => {
      const url = getBackendTargetUrl(['auth', 'login']);
      expect(url).toContain('/auth/login');
    });

    it('falls back to the hardcoded production backend URL when nothing is configured', async () => {
      const originalBackend = process.env.BACKEND_API_URL;
      const originalPublicBackend = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      delete process.env.BACKEND_API_URL;
      delete process.env.NEXT_PUBLIC_BACKEND_API_URL;

      jest.resetModules();
      jest.doMock('@/config/env', () => ({
        env: { APP_URL: 'http://localhost:3000', API_URL: '/api/v1', BACKEND_API_URL: '' },
      }));

      try {
        const { getBackendTargetUrl: isolatedGetBackendTargetUrl } = await import('./helpers');
        const url = isolatedGetBackendTargetUrl(['auth', 'login']);
        expect(url).toBe('https://task-flow-be-eight.vercel.app/api/v1/auth/login');
      } finally {
        jest.dontMock('@/config/env');
        jest.resetModules();
        if (originalBackend !== undefined) process.env.BACKEND_API_URL = originalBackend;
        if (originalPublicBackend !== undefined) {
          process.env.NEXT_PUBLIC_BACKEND_API_URL = originalPublicBackend;
        }
      }
    });
  });

  describe('resolvePostLoginRedirect', () => {
    it('returns query redirect param when safe', () => {
      expect(
        resolvePostLoginRedirect({
          redirectParam: '/users/settings',
          redirectUrl: '/users',
          defaultModule: 'users',
        })
      ).toBe('/users/settings');
    });

    it('ignores unsafe or auth redirect params and uses redirectUrl', () => {
      expect(
        resolvePostLoginRedirect({
          redirectParam: '/auth/login',
          redirectUrl: '/users',
          defaultModule: 'users',
        })
      ).toBe('/users');
    });

    it('uses defaultModule when redirectUrl is not present', () => {
      expect(
        resolvePostLoginRedirect({
          defaultModule: 'users',
        })
      ).toBe('/users');

      expect(
        resolvePostLoginRedirect({
          defaultModule: '/dashboard',
        })
      ).toBe('/dashboard');
    });

    it('falls back to /dashboard when no options are provided', () => {
      expect(resolvePostLoginRedirect({})).toBe('/dashboard');
    });
  });

  describe('getRoleBadgeClass', () => {
    it('returns correct Tailwind classes for roles', () => {
      expect(getRoleBadgeClass('Taskflow Admin')).toContain('bg-purple-50');
      expect(getRoleBadgeClass('Project Manager')).toContain('bg-blue-50');
      expect(getRoleBadgeClass('Developer')).toContain('bg-emerald-50');
      expect(getRoleBadgeClass('QA')).toContain('bg-amber-50');
      expect(getRoleBadgeClass(undefined)).toContain('bg-slate-50');
    });
  });

  describe('getUserInitials', () => {
    it('returns capitalized initials', () => {
      expect(getUserInitials('Jane', 'Doe')).toBe('JD');
      expect(getUserInitials('Jane')).toBe('J');
      expect(getUserInitials('', '')).toBe('U');
      expect(getUserInitials(undefined, undefined)).toBe('U');
    });
  });

  describe('formatCountdown', () => {
    it('formats seconds into mm:ss format', () => {
      expect(formatCountdown(60)).toBe('1:00');
      expect(formatCountdown(59)).toBe('0:59');
      expect(formatCountdown(5)).toBe('0:05');
      expect(formatCountdown(125)).toBe('2:05');
      expect(formatCountdown(0)).toBe('0:00');
      expect(formatCountdown(-10)).toBe('0:00');
    });
  });

  describe('formatDate', () => {
    it('formats valid ISO date strings', () => {
      expect(formatDate('2026-01-01T00:00:00.000Z')).toContain('2026');
    });

    it('returns N/A for empty or invalid dates', () => {
      expect(formatDate('')).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
      expect(formatDate('invalid-date')).toBe('N/A');
    });

    it('returns N/A when reading the date throws', () => {
      const throwingDate = {
        getTime: () => {
          throw new Error('boom');
        },
      } as unknown as Date;
      expect(formatDate(throwingDate)).toBe('N/A');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns N/A for empty or invalid dates', () => {
      expect(formatRelativeTime('')).toBe('N/A');
      expect(formatRelativeTime(undefined)).toBe('N/A');
      expect(formatRelativeTime('invalid-date')).toBe('N/A');
    });

    it('returns N/A when reading the date throws', () => {
      const throwingDate = {
        getTime: () => {
          throw new Error('boom');
        },
      } as unknown as Date;
      expect(formatRelativeTime(throwingDate)).toBe('N/A');
    });

    it('returns "Just now" for very recent timestamps', () => {
      const recent = new Date(Date.now() - 5 * 1000).toISOString();
      expect(formatRelativeTime(recent)).toBe('Just now');
    });

    it('returns minutes ago for timestamps under an hour old', () => {
      const minutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(formatRelativeTime(minutesAgo)).toBe('5m ago');
    });

    it('returns hours ago for timestamps under a day old', () => {
      const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(hoursAgo)).toBe('3h ago');
    });

    it('returns days ago for timestamps under a week old', () => {
      const daysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(daysAgo)).toBe('2d ago');
    });

    it('falls back to formatDate for timestamps a week or older', () => {
      const weekAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(weekAgo)).toBe(formatDate(weekAgo));
    });

    it('accepts a Date object directly', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });
  });
});
