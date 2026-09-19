'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Hydration-safe hook that returns true only after client mounting
 */
export const useMounted = (): boolean => {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
};
