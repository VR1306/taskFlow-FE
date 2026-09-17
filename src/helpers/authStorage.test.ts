import { authStorage } from './authStorage';

describe('Auth Storage Helper', () => {
  beforeEach(() => {
    // Clear cookies and localStorage
    document.cookie = 'token=; path=/; max-age=0;';
    document.cookie = 'refreshToken=; path=/; max-age=0;';
    localStorage.clear();
  });

  it('sets auth cookie and stores user and tokens in localStorage with rememberMe', () => {
    const user = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    };

    authStorage.setAuthSession('test-access-token', user, true, 'test-refresh-token', 'users');

    expect(authStorage.getToken()).toBe('test-access-token');
    expect(authStorage.getRefreshToken()).toBe('test-refresh-token');
    expect(authStorage.getUser()).toEqual(user);
    expect(authStorage.getDefaultModule()).toBe('users');
  });

  it('updates tokens with setTokens without wiping user', () => {
    const user = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    };

    authStorage.setAuthSession('old-access-token', user, false, 'old-refresh-token');
    authStorage.setTokens('new-access-token', 'new-refresh-token');

    expect(authStorage.getToken()).toBe('new-access-token');
    expect(authStorage.getRefreshToken()).toBe('new-refresh-token');
    expect(authStorage.getUser()).toEqual(user);
  });

  it('clears session and tokens properly', () => {
    const user = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    };

    authStorage.setAuthSession('test-access-token', user, false, 'test-refresh-token', 'users');
    expect(authStorage.getToken()).toBe('test-access-token');
    expect(authStorage.getRefreshToken()).toBe('test-refresh-token');

    authStorage.clearAuthSession();
    expect(authStorage.getToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
    expect(authStorage.getUser()).toBeNull();
  });
});
