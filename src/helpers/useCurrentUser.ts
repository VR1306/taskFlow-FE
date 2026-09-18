'use client';

import { useSyncExternalStore, useMemo } from 'react';
import { AuthUser } from '@/types';

const USER_STORAGE_KEY = 'taskflow_user';

const subscribeStorage = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getSnapshot = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(USER_STORAGE_KEY);
  } catch {
    return null;
  }
};

const getServerSnapshot = (): string | null => null;

/**
 * Hydration-safe React hook for retrieving current user from localStorage
 */
export const useCurrentUser = (): AuthUser | null => {
  const raw = useSyncExternalStore(subscribeStorage, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }, [raw]);
};
