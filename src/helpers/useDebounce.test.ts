import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('debounces value updates according to the specified delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 350 },
    });

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 350 });

    // Value should not update immediately
    expect(result.current).toBe('initial');

    // Advance timers partially (200ms)
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Advance past the remaining time (150ms)
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current).toBe('updated');
  });

  it('uses default 350ms delay when not specified', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(result.current).toBe('second');
  });

  it('cancels previous timeout on rapid consecutive updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => {
      jest.advanceTimersByTime(150);
    });

    rerender({ value: 'c' });
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Should still be 'a' because 'b' was cancelled and 'c' has only had 150ms
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current).toBe('c');
  });
});
