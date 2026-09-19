import { renderHook } from '@testing-library/react';
import { useMounted } from './useMounted';

describe('useMounted hook', () => {
  it('returns true after mounting on the client', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });
});
