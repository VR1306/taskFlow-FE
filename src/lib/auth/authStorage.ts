import { AuthUser } from '@/types';

const TOKEN_COOKIE_NAME = 'token';
const USER_STORAGE_KEY = 'taskflow_user';

export const authStorage = {
  setAuthSession: (token: string, user: AuthUser, rememberMe = false): void => {
    if (typeof document === 'undefined') return;

    // Cookie expires in 30 days if rememberMe is true, else session cookie
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : '';
    const maxAgeSegment = maxAge ? `; max-age=${maxAge}` : '';
    document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/${maxAgeSegment}; SameSite=Lax`;

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors in restricted browser environments
    }
  },

  getToken: (): string | null => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.split('=');
      if (name === TOKEN_COOKIE_NAME) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return null;
  },

  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  clearAuthSession: (): void => {
    if (typeof document === 'undefined') return;

    document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  },
};

export default authStorage;
