'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authStorage, useCurrentUser } from '@/helpers';
import { authService } from '@/services/auth';
import { Image, Button } from '@/components/ui';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
    } finally {
      authStorage.clearAuthSession();
      router.push('/auth/login');
    }
  };

  const isUsersActive = pathname.startsWith('/users');
  const isDashboardActive = pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Module Links */}
          <div className="flex items-center gap-8">
            <Link href="/users" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-sm p-1.5 transition-transform group-hover:scale-105">
                <Image src="/icons/logo.svg" alt="TaskFlow Logo" width={22} height={22} />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
              <Link
                href="/users"
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isUsersActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Users Module
              </Link>
              <Link
                href="/dashboard"
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isDashboardActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* User Profile & Logout Action */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="text-[11px] text-slate-500">{currentUser.email}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              loadingText="Logging out..."
              className="text-xs text-rose-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
