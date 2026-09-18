'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/helpers';
import { authService } from '@/services/auth';
import { Sidebar, Header } from '@/components/layout';
import { ConfirmationModal } from '@/components/ui';
import { ChangePasswordModal } from '@/components/auth';
import {
  useAppDispatch,
  useAppSelector,
  closeLogoutModal,
  setIsLoggingOut,
  clearCredentials,
  closeChangePasswordModal,
} from '@/store';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const isLogoutModalOpen = useAppSelector((state) => state.auth.isLogoutModalOpen);
  const isLoggingOut = useAppSelector((state) => state.auth.isLoggingOut);
  const isChangePasswordModalOpen = useAppSelector((state) => state.auth.isChangePasswordModalOpen);

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
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
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
