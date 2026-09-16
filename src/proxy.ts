import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API routes, and system endpoints
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.svg') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const isAuthRoute = pathname.startsWith('/auth');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/users');

  // Redirect exact '/auth' path to '/auth/login'
  if (pathname === '/auth') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 1. Unauthenticated users trying to access protected routes -> redirect to /auth/login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users trying to access auth pages -> redirect to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
