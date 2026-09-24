/** @jest-environment node */
import { authStorage } from './authStorage';
import { getBaseApiUrl } from './helpers';

it('does not access browser storage during server rendering', () => {
  const user = { id: '1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };
  expect(() => authStorage.setAuthSession('token', user)).not.toThrow();
  expect(() => authStorage.setTokens('token')).not.toThrow();
  expect(() => authStorage.setRememberedCredentials(true, user.email)).not.toThrow();
  expect(() => authStorage.clearAuthSession()).not.toThrow();
  expect(authStorage.getToken()).toBeNull();
  expect(authStorage.getRefreshToken()).toBeNull();
  expect(authStorage.getUser()).toBeNull();
  expect(authStorage.getRememberedEmail()).toBe('');
  expect(authStorage.getRememberMe()).toBe(false);
  expect(authStorage.getDefaultModule()).toBe('dashboard');
});

it('resolves relative API paths against the application URL on the server', () => {
  expect(getBaseApiUrl('/api/v1', 'https://example.com/')).toBe('https://example.com/api/v1');
  expect(getBaseApiUrl('https://api.example.com/')).toBe('https://api.example.com');
});
