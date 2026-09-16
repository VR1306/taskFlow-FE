import { authStorage } from './authStorage';

describe('Auth Storage Helper', () => {
  beforeEach(() => {
    // Clear cookies and localStorage
    document.cookie = 'token=; path=/; max-age=0;';
    localStorage.clear();
  });

  it('sets auth cookie and stores user in localStorage with rememberMe', () => {
    const user = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    };

    authStorage.setAuthSession('test-jwt-token', user, true);

    expect(authStorage.getToken()).toBe('test-jwt-token');
    expect(authStorage.getUser()).toEqual(user);
  });

  it('clears session properly', () => {
    const user = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    };

    authStorage.setAuthSession('test-jwt-token', user, false);
    expect(authStorage.getToken()).toBe('test-jwt-token');

    authStorage.clearAuthSession();
    expect(authStorage.getToken()).toBeNull();
    expect(authStorage.getUser()).toBeNull();
  });
});
