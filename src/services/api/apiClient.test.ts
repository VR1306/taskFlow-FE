import { apiClient, apiRequest } from './apiClient';
import { authStorage } from '@/helpers';

describe('API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    authStorage.clearAuthSession();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('performs successful GET request and parses JSON data', async () => {
    const mockData = { success: true, payload: 'test' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await apiClient.get<typeof mockData>('/health');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('automatically attaches Authorization Bearer header when token exists', async () => {
    authStorage.setAuthSession('my-jwt-token', {
      id: '1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
    });

    const mockData = { success: true };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    await apiClient.get('/users/getAllUsers');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/getAllUsers'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-jwt-token',
        }),
      })
    );
  });

  it('refreshes token and retries request when encountering 401', async () => {
    authStorage.setAuthSession(
      'expired-token',
      { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
      true,
      'valid-refresh-token'
    );

    const mockSuccess = { success: true, data: [{ id: '1', name: 'Alice' }] };

    global.fetch = jest
      .fn()
      // 1st call: initial protected request fails with 401
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Access token has expired' }),
      })
      // 2nd call: refresh token request succeeds
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      })
      // 3rd call: retried protected request succeeds with new token
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSuccess,
      });

    const result = await apiClient.get<typeof mockSuccess>('/users/getAllUsers');

    expect(result).toEqual(mockSuccess);
    expect(authStorage.getToken()).toBe('new-access-token');
    expect(authStorage.getRefreshToken()).toBe('new-refresh-token');
  });

  it('clears session when refresh token fails on 401', async () => {
    authStorage.setAuthSession(
      'expired-token',
      { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
      true,
      'invalid-refresh-token'
    );

    global.fetch = jest
      .fn()
      // 1st call: initial protected request fails with 401
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Access token expired' }),
      })
      // 2nd call: refresh token request fails
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Refresh token invalid' }),
      });

    await expect(apiClient.get('/users/getAllUsers')).rejects.toThrow();
    expect(authStorage.getToken()).toBeNull();
  });

  it('performs successful POST request with serialized body', async () => {
    const mockResponse = { success: true };
    const requestBody = { email: 'test@example.com' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.post<typeof mockResponse>('/test', requestBody);
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestBody),
      })
    );
  });

  it('throws ApiError with message from backend when response is not ok', async () => {
    const errorPayload = { success: false, message: 'User not found' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => errorPayload,
    });

    await expect(apiRequest('/auth/signIn')).rejects.toThrow('User not found');
  });

  it('joins errors array into message when backend returns multiple errors', async () => {
    const errorPayload = {
      success: false,
      errors: ['Email is required', 'Password is required'],
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => errorPayload,
    });

    await expect(apiRequest('/auth/signIn')).rejects.toThrow(
      'Email is required. Password is required'
    );
  });

  it('handles non-JSON error responses gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(apiRequest('/crash')).rejects.toThrow('Request failed with status 500');
  });

  it('provides helper methods for PUT and DELETE', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiClient.put('/update', { id: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/update'),
      expect.objectContaining({ method: 'PUT' })
    );

    await apiClient.delete('/delete/1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/delete/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
