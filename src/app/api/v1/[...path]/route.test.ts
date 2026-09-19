/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE, OPTIONS } from './route';

describe('BFF Route Handler (/api/v1/[...path])', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('forwards GET requests to the backend with query parameters and headers', async () => {
    const mockData = { success: true, user: { id: '123' } };
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify(mockData),
    });

    const request = new NextRequest('http://localhost:3000/api/v1/users/profile?tab=info', {
      method: 'GET',
      headers: {
        authorization: 'Bearer token-123',
      },
    });

    const response = await GET(request, {
      params: Promise.resolve({ path: ['users', 'profile'] }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/profile?tab=info'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      })
    );
  });

  it('forwards POST request body to the backend', async () => {
    const mockResponse = { success: true, token: 'xyz' };
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify(mockResponse),
    });

    const body = { email: 'test@example.com', password: 'password123' };
    const request = new NextRequest('http://localhost:3000/api/v1/auth/signIn', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ['auth', 'signIn'] }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(mockResponse);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/signIn'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      })
    );
  });

  it('uses cookie token when authorization header is not provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    const request = new NextRequest('http://localhost:3000/api/v1/auth/me', {
      method: 'GET',
      headers: {
        cookie: 'token=cookie-jwt-token',
      },
    });

    const response = await GET(request, {
      params: Promise.resolve({ path: ['auth', 'me'] }),
    });

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer cookie-jwt-token',
        }),
      })
    );
  });

  it('handles backend error responses and proxies the status code', async () => {
    const mockError = { success: false, message: 'Invalid credentials' };
    global.fetch = jest.fn().mockResolvedValue({
      status: 401,
      text: async () => JSON.stringify(mockError),
    });

    const request = new NextRequest('http://localhost:3000/api/v1/auth/signIn', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@test.com' }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ['auth', 'signIn'] }),
    });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual(mockError);
  });

  it('handles fetch exceptions by returning a 502 status', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network connection refused'));

    const request = new NextRequest('http://localhost:3000/api/v1/auth/signIn', {
      method: 'POST',
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ['auth', 'signIn'] }),
    });

    expect(response.status).toBe(502);
    const json = await response.json();
    expect(json).toEqual({
      success: false,
      message: 'Network connection refused',
    });
  });

  it('supports PUT, DELETE, and OPTIONS methods', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    const putRequest = new NextRequest('http://localhost:3000/api/v1/users/1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    const putResponse = await PUT(putRequest, {
      params: Promise.resolve({ path: ['users', '1'] }),
    });
    expect(putResponse.status).toBe(200);

    const deleteRequest = new NextRequest('http://localhost:3000/api/v1/users/1', {
      method: 'DELETE',
    });
    const deleteResponse = await DELETE(deleteRequest, {
      params: Promise.resolve({ path: ['users', '1'] }),
    });
    expect(deleteResponse.status).toBe(200);

    const optionsResponse = await OPTIONS();
    expect(optionsResponse.status).toBe(204);
  });

  it('forwards CSV response headers and content directly without json parsing', async () => {
    const csvData = 'ID,Name\n1,Test';
    const mockHeaders = new Map([
      ['content-type', 'text/csv; charset=utf-8'],
      ['content-disposition', 'attachment; filename="users.csv"'],
    ]);

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: mockHeaders,
      text: async () => csvData,
    });

    const request = new NextRequest('http://localhost:3000/api/v1/users/export?format=csv', {
      method: 'GET',
    });

    const response = await GET(request, {
      params: Promise.resolve({ path: ['users', 'export'] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toBe('attachment; filename="users.csv"');
    const text = await response.text();
    expect(text).toBe(csvData);
  });
});
