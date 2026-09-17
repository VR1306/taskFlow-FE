'use client';

import { useSyncExternalStore } from 'react';
import { AuthUser } from '@/types';

const USER_STORAGE_KEY = 'taskflow_user';

const subscribeStorage = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

/**
 * Hydration-safe React hook for retrieving current user from localStorage
 */
export const useCurrentUser = (): AuthUser | null => {
  const userJson = useSyncExternalStore(
    subscribeStorage,
    () => {
      try {
        return localStorage.getItem(USER_STORAGE_KEY);
      } catch {
        return null;
      }
    },
    () => null
  );

  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
};
