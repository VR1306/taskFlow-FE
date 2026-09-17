'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/helpers';
import { authService } from '@/services/auth';
import { Sidebar, Header } from '@/components/layout';
import { ConfirmationModal } from '@/components/ui';
import {
  useAppDispatch,
  useAppSelector,
  closeLogoutModal,
  setIsLoggingOut,
  clearCredentials,
} from '@/store';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const isLogoutModalOpen = useAppSelector((state) => state.auth.isLogoutModalOpen);
  const isLoggingOut = useAppSelector((state) => state.auth.isLoggingOut);

  const handleCloseLogoutModal = useCallback(() => {
    dispatch(closeLogoutModal());
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
      router.push('/auth/login');
    }
  }, [dispatch, router]);

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
