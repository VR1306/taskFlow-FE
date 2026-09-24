import { apiClient, apiRequest, type RequestOptions } from './apiClient';
import { authStorage } from '@/helpers';

const mockFetch = jest.fn();
const originalFetch = global.fetch;
const user = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' };
const unauthorized = { ok: false, status: 401, json: async () => ({ message: 'Session expired' }) };

beforeEach(() => {
  authStorage.clearAuthSession();
  mockFetch.mockReset();
  global.fetch = mockFetch;
});
afterEach(() => {
  global.fetch = originalFetch;
});

it('clears a session without a refresh token', async () => {
  authStorage.setAuthSession('expired', user);
  mockFetch.mockResolvedValue(unauthorized);
  await expect(apiRequest('private')).rejects.toThrow('Session expired');
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(authStorage.getToken()).toBeNull();
});

it.each([
  { label: 'missing token', response: { ok: true, json: async () => ({}) } },
  { label: 'network failure', response: null },
])('clears the session after refresh $label', async ({ response }) => {
  authStorage.setAuthSession('expired', user, true, 'refresh');
  mockFetch.mockResolvedValueOnce(unauthorized);
  if (response) mockFetch.mockResolvedValueOnce(response);
  else mockFetch.mockRejectedValueOnce(new Error('Offline'));
  await expect(apiRequest('/private')).rejects.toThrow('Session expired');
  expect(authStorage.getToken()).toBeNull();
});

it('accepts a legacy refreshed token while retaining the refresh token', async () => {
  authStorage.setAuthSession('expired', user, true, 'refresh');
  mockFetch
    .mockResolvedValueOnce(unauthorized)
    .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'renewed' }) })
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ saved: true }) });
  await expect(apiRequest('/private')).resolves.toEqual({ saved: true });
  expect(authStorage.getRefreshToken()).toBe('refresh');
  expect(authStorage.getToken()).toBe('renewed');
});

it.each([
  '/auth/signIn',
  '/auth/refresh-token',
  '/auth/refreshToken',
  '/auth/forgot-password',
  '/auth/reset-password',
])('does not refresh for %s', async (endpoint) => {
  authStorage.setAuthSession('expired', user, true, 'refresh');
  mockFetch.mockResolvedValue(unauthorized);
  await expect(apiRequest(endpoint)).rejects.toThrow('Session expired');
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

it('honors an explicit refresh bypass', async () => {
  mockFetch.mockResolvedValue(unauthorized);
  await expect(apiRequest('/private', { skipAuthRefresh: true })).rejects.toThrow(
    'Session expired'
  );
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

it.each<{ options: RequestOptions; expected: Record<string, string> }>([
  { options: { skipAuthToken: true }, expected: {} },
  {
    options: { headers: { Authorization: 'Custom token' } },
    expected: { Authorization: 'Custom token' },
  },
  {
    options: { headers: { authorization: 'Custom lower-case' } },
    expected: { authorization: 'Custom lower-case' },
  },
])('respects request authentication options $options', async ({ options, expected }) => {
  authStorage.setAuthSession('stored', user);
  mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
  await apiRequest('public', options);
  const headers = mockFetch.mock.calls[0][1].headers;
  expect(headers).toMatchObject(expected);
  expect(Object.values(headers)).not.toContain('Bearer stored');
});

it('uses an error field and tolerates empty validation errors', async () => {
  mockFetch.mockResolvedValue({
    ok: false,
    status: 400,
    json: async () => ({ error: 'Invalid request', errors: [] }),
  });
  await expect(apiRequest('/private')).rejects.toThrow('Invalid request');
});

it.each(['upload', 'downloadBlob'] as const)(
  'handles non-JSON and empty errors in %s',
  async (method) => {
    for (const body of [null, {}]) {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          if (body === null) throw new Error('Invalid JSON');
          return body;
        },
      });
      const result =
        method === 'upload'
          ? apiClient.upload('files', new FormData())
          : apiClient.downloadBlob('files');
      await expect(result).rejects.toThrow('Request failed with status 502');
    }
  }
);

it.each([
  { options: {}, expected: 'Bearer stored' },
  { options: { skipAuthToken: true }, expected: undefined },
  { options: { headers: { Authorization: 'Custom' } }, expected: 'Custom' },
])('applies binary request credentials $expected', async ({ options, expected }) => {
  authStorage.setAuthSession('stored', user);
  const blob = new Blob(['file']);
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    blob: async () => blob,
  });
  await apiClient.upload('files', new FormData(), options);
  await expect(apiClient.downloadBlob('files', options)).resolves.toBe(blob);
  for (const [, config] of mockFetch.mock.calls)
    expect(config.headers.Authorization).toBe(expected);
});
