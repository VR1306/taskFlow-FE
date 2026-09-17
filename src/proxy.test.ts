/**
 * @jest-environment node
 */
import { proxy } from './proxy';
import { NextRequest } from 'next/server';

describe('Proxy / Middleware Authentication Guard', () => {
  const createMockRequest = (pathname: string, token?: string): NextRequest => {
    const url = `http://localhost:3000${pathname}`;
    const req = new NextRequest(new URL(url));
    if (token) {
      req.cookies.set('token', token);
    }
    return req;
  };

  it('skips API routes and static asset endpoints', () => {
    const apiReq = createMockRequest('/api/v1/auth/signIn');
    expect(proxy(apiReq).status).toBe(200);

    const assetReq = createMockRequest('/_next/static/chunk.js');
    expect(proxy(assetReq).status).toBe(200);

    const iconReq = createMockRequest('/icon.svg');
    expect(proxy(iconReq).status).toBe(200);
  });

  it('redirects exact /auth to /auth/login', () => {
    const req = createMockRequest('/auth');
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/auth/login');
  });

  it('redirects unauthenticated user accessing protected /dashboard or /users to /auth/login with redirect param', () => {
    const dashReq = createMockRequest('/dashboard');
    const dashRes = proxy(dashReq);
    expect(dashRes.status).toBe(307);
    expect(dashRes.headers.get('location')).toBe(
      'http://localhost:3000/auth/login?redirect=%2Fdashboard'
    );

    const usersReq = createMockRequest('/users');
    const usersRes = proxy(usersReq);
    expect(usersRes.status).toBe(307);
    expect(usersRes.headers.get('location')).toBe(
      'http://localhost:3000/auth/login?redirect=%2Fusers'
    );
  });

  it('redirects authenticated user accessing /auth/login to /users default module', () => {
    const req = createMockRequest('/auth/login', 'valid-jwt-token');
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/users');
  });

  it('allows authenticated users to access protected routes', () => {
    const req = createMockRequest('/users', 'valid-jwt-token');
    const res = proxy(req);
    expect(res.status).toBe(200);
  });
});
