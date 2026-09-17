import { renderHook, act } from '@testing-library/react';
import { useCurrentUser } from './useCurrentUser';
import { AuthUser } from '@/types';

describe('useCurrentUser hook', () => {
  const mockUser: AuthUser = {
    id: '123',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Admin',
  };

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('returns null when no user is stored in localStorage', () => {
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current).toBeNull();
  });

  it('returns the parsed AuthUser when valid user exists in localStorage', () => {
    localStorage.setItem('taskflow_user', JSON.stringify(mockUser));
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current).toEqual(mockUser);
  });

  it('returns null when JSON is invalid in localStorage', () => {
    localStorage.setItem('taskflow_user', 'invalid-json{');
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current).toBeNull();
  });

  it('handles localStorage errors gracefully', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('Storage access blocked');
    });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current).toBeNull();
  });

  it('updates when storage event is fired', () => {
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current).toBeNull();

    act(() => {
      localStorage.setItem('taskflow_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('storage'));
    });

    expect(result.current).toEqual(mockUser);
  });
});
