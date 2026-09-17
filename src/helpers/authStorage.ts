import { AuthUser } from '@/types';

const TOKEN_COOKIE_NAME = 'token';
const REFRESH_COOKIE_NAME = 'refreshToken';
const USER_STORAGE_KEY = 'taskflow_user';
const REFRESH_STORAGE_KEY = 'taskflow_refresh_token';
const DEFAULT_MODULE_KEY = 'taskflow_default_module';

export const authStorage = {
  setAuthSession: (
    token: string,
    user: AuthUser,
    rememberMe = false,
    refreshToken?: string,
    defaultModule?: string
  ): void => {
    if (typeof document === 'undefined') return;

    // Cookie expires in 30 days if rememberMe is true, else session cookie (1 day)
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    const maxAgeSegment = `; max-age=${maxAge}`;

    document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/${maxAgeSegment}; SameSite=Lax`;

    if (refreshToken) {
      document.cookie = `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}; path=/${maxAgeSegment}; SameSite=Lax`;
    }

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
      }
      if (defaultModule) {
        localStorage.setItem(DEFAULT_MODULE_KEY, defaultModule);
      }
    } catch {
      // Ignore storage errors in restricted browser environments
    }
  },

  setTokens: (accessToken: string, refreshToken?: string): void => {
    if (typeof document === 'undefined') return;

    document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(accessToken)}; path=/; SameSite=Lax`;

    if (refreshToken) {
      document.cookie = `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}; path=/; SameSite=Lax`;
      try {
        localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
      } catch {
        // Ignore storage errors
      }
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

  getRefreshToken: (): string | null => {
    if (typeof document === 'undefined') return null;

    // Try reading from cookie first
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.split('=');
      if (name === REFRESH_COOKIE_NAME) {
        return decodeURIComponent(rest.join('='));
      }
    }

    // Fallback to localStorage
    try {
      return localStorage.getItem(REFRESH_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  getDefaultModule: (): string => {
    if (typeof window === 'undefined') return 'users';

    try {
      return localStorage.getItem(DEFAULT_MODULE_KEY) || 'users';
    } catch {
      return 'users';
    }
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
    document.cookie = `${REFRESH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(REFRESH_STORAGE_KEY);
      localStorage.removeItem(DEFAULT_MODULE_KEY);
    } catch {
      // Ignore storage errors
    }
  },
};

export default authStorage;
