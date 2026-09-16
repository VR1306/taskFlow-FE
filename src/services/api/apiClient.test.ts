import { apiClient, apiRequest } from './apiClient';

describe('API Client', () => {
  const originalFetch = global.fetch;

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
