'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value across renders.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds (defaults to 350ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
