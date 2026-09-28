'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStorage, useCurrentUser, hasPermission, useMounted } from '@/helpers';
import { authService } from '@/services/auth';
import { Sidebar, Header, AccessDenied } from '@/components/layout';
import { ConfirmationModal } from '@/components/ui';
import { ChangePasswordModal } from '@/components/auth';
import { NAV_ITEMS } from '@/constants';
import {
  useAppDispatch,
  useAppSelector,
  closeLogoutModal,
  setIsLoggingOut,
  clearCredentials,
  closeChangePasswordModal,
  invalidateProjectsCache,
  invalidateUsersCache,
  invalidateRolesCache,
} from '@/store';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const isLogoutModalOpen = useAppSelector((state) => state.auth.isLogoutModalOpen);
  const isLoggingOut = useAppSelector((state) => state.auth.isLoggingOut);
  const isChangePasswordModalOpen = useAppSelector((state) => state.auth.isChangePasswordModalOpen);
  const reduxUser = useAppSelector((state) => state.auth.user);
  const storageUser = useCurrentUser();
  const currentUser = reduxUser || storageUser;
  const mounted = useMounted();

  // Blocks direct URL navigation to a module the user lacks permission for (the sidebar
  // only hides the link — it doesn't stop someone typing/bookmarking the URL directly).
  // Routes with no matching NAV_ITEMS entry (e.g. /notifications) are left unrestricted.
  const isRouteAllowed = useMemo(() => {
    if (!mounted) return true;
    const matchingNavItem = NAV_ITEMS.find((item) =>
      item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
    );
    return (
      !matchingNavItem?.requiredPermission ||
      hasPermission(currentUser, matchingNavItem.requiredPermission)
    );
  }, [mounted, pathname, currentUser]);

  // Client-side auth verification & browser back/forward (bfcache) navigation guard
  useEffect(() => {
    const checkAuth = () => {
      const token = authStorage.getToken();
      if (!token) {
        setIsAuthenticated(false);
        router.replace('/auth/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
    window.addEventListener('popstate', checkAuth);
    window.addEventListener('pageshow', checkAuth);
    return () => {
      window.removeEventListener('popstate', checkAuth);
      window.removeEventListener('pageshow', checkAuth);
    };
  }, [router]);

  const handleCloseLogoutModal = useCallback(() => {
    dispatch(closeLogoutModal());
  }, [dispatch]);

  const handleCloseChangePasswordModal = useCallback(() => {
    dispatch(closeChangePasswordModal());
  }, [dispatch]);

  const handleConfirmLogout = useCallback(async () => {
    try {
      dispatch(setIsLoggingOut(true));
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
    } finally {
      authStorage.clearAuthSession();
      dispatch(clearCredentials());
      // Clear per-user cached list pages so a different account logging in on the same
      // tab (no hard reload in between) can't inherit the previous user's cached,
      // differently-scoped results (e.g. an admin's full project list leaking to the
      // next, more restricted user).
      dispatch(invalidateProjectsCache());
      dispatch(invalidateUsersCache());
      dispatch(invalidateRolesCache());
      setIsAuthenticated(false);
      router.replace('/auth/login');
    }
  }, [dispatch, router]);

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Module Sidebar */}
      <Sidebar />

      {/* Main Application Area (padded by sidebar width to eliminate any overlap) */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 min-w-0">
          {isRouteAllowed ? children : <AccessDenied />}
        </main>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleCloseChangePasswordModal}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
        title="Sign Out of TaskFlow"
        message="Are you sure you want to sign out? You will need to sign in again to access your workspace and active sessions."
        confirmText="Sign Out"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
