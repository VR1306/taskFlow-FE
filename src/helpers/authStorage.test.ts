import { authStorage } from './authStorage';

describe('Auth Storage Helper', () => {
  beforeEach(() => {
    // Clear cookies and localStorage
    document.cookie = 'token=; path=/; max-age=0;';
    document.cookie = 'refreshToken=; path=/; max-age=0;';
    localStorage.clear();
  });

  it('sets auth cookie and stores user, tokens, and remembered email with rememberMe: true', () => {
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
    expect(authStorage.getRememberedEmail()).toBe('jane@example.com');
    expect(authStorage.getRememberMe()).toBe(true);
  });

  it('cleans remembered email when rememberMe: false', () => {
    const user = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    };

    authStorage.setRememberedCredentials(true, 'jane@example.com');
    expect(authStorage.getRememberedEmail()).toBe('jane@example.com');

    authStorage.setAuthSession('test-access-token', user, false, 'test-refresh-token', 'users');
    expect(authStorage.getRememberedEmail()).toBe('');
    expect(authStorage.getRememberMe()).toBe(false);
  });

  it('sets and removes remembered credentials manually with setRememberedCredentials', () => {
    authStorage.setRememberedCredentials(true, 'admin@example.com');
    expect(authStorage.getRememberedEmail()).toBe('admin@example.com');
    expect(authStorage.getRememberMe()).toBe(true);

    authStorage.setRememberedCredentials(false);
    expect(authStorage.getRememberedEmail()).toBe('');
    expect(authStorage.getRememberMe()).toBe(false);
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

  it('defaults default module to "users" when none has been stored', () => {
    expect(authStorage.getDefaultModule()).toBe('users');
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

describe('restricted browser storage', () => {
  beforeEach(() => {
    document.cookie = 'token=; path=/; max-age=0;';
    document.cookie = 'refreshToken=; path=/; max-age=0;';
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns safe defaults when reads are blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    expect(authStorage.getRememberedEmail()).toBe('');
    expect(authStorage.getRememberMe()).toBe(false);
    expect(authStorage.getRefreshToken()).toBeNull();
    expect(authStorage.getDefaultModule()).toBe('users');
    expect(authStorage.getUser()).toBeNull();
  });

  it('retains cookie authentication when local storage writes fail', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    const user = { id: '1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };
    expect(() => authStorage.setAuthSession('access', user)).not.toThrow();
    expect(authStorage.getToken()).toBe('access');
    expect(() => authStorage.setTokens('renewed', 'refresh')).not.toThrow();
    expect(authStorage.getRefreshToken()).toBe('refresh');
    expect(() => authStorage.setRememberedCredentials(true, user.email)).not.toThrow();
  });

  it('clears authentication cookies when storage removal fails', () => {
    authStorage.setTokens('access', 'refresh');
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    expect(() => authStorage.clearAuthSession()).not.toThrow();
    expect(authStorage.getToken()).toBeNull();
    expect(() => authStorage.setRememberedCredentials(false)).not.toThrow();
  });
});
