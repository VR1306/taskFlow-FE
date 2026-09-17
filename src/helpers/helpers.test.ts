import {
  cleanUrl,
  getBaseApiUrl,
  getBackendTargetUrl,
  resolvePostLoginRedirect,
  getRoleBadgeClass,
  getUserInitials,
  formatCountdown,
  formatDate,
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
      expect(getRoleBadgeClass('SuperAdmin')).toContain('bg-purple-50');
      expect(getRoleBadgeClass('Admin')).toContain('bg-blue-50');
      expect(getRoleBadgeClass('User')).toContain('bg-slate-50');
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
  });
});
