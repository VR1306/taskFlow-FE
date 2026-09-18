'use client';

import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Image, Avatar, Badge } from '@/components/ui';
import {
  useAppDispatch,
  useAppSelector,
  toggleMobileSidebar,
  openChangePasswordModal,
  openLogoutModal,
} from '@/store';
import { useCurrentUser } from '@/helpers';
import { CHANGE_PASSWORD_CONSTANTS } from '@/constants';

export const Header = memo(function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const storageUser = useCurrentUser();
  const currentUser = reduxUser || storageUser;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleMobile = useCallback(() => {
    dispatch(toggleMobileSidebar());
  }, [dispatch]);

  const handleToggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  const handleOpenChangePassword = useCallback(() => {
    handleCloseUserMenu();
    dispatch(openChangePasswordModal());
  }, [dispatch, handleCloseUserMenu]);

  const handleOpenLogout = useCallback(() => {
    handleCloseUserMenu();
    dispatch(openLogoutModal());
  }, [dispatch, handleCloseUserMenu]);

  // Outside click & Escape key listener to close menu
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const pageTitle = pathname.includes('/users') ? 'User Management' : 'Dashboard';

  const userRoleVariant = useMemo(() => {
    switch (currentUser?.role) {
      case 'SuperAdmin':
        return 'purple';
      case 'Admin':
        return 'primary';
      default:
        return 'default';
    }
  }, [currentUser?.role]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile hamburger & module title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleMobile}
          aria-label="Open sidebar menu"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Image src="/icons/menu.svg" alt="Menu" width={20} height={20} />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Interactive User profile status pill & Action Menu */}
      <div className="relative" ref={menuContainerRef}>
        {mounted && currentUser && (
          <>
            <button
              type="button"
              onClick={handleToggleUserMenu}
              aria-label="User account menu"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              className={`flex items-center gap-2 rounded-full border px-2.5 sm:px-3 py-1.5 shadow-2xs transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                isUserMenuOpen
                  ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/15'
                  : 'border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/90 hover:border-slate-300'
              }`}
            >
              <Avatar
                firstName={currentUser.firstName}
                lastName={currentUser.lastName}
                size="xs"
                colorScheme="blue"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                {currentUser.role && (
                  <Badge size="sm" variant={userRoleVariant}>
                    {currentUser.role}
                  </Badge>
                )}
              </div>
              <div
                className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
              >
                <Image
                  src="/icons/chevron-right.svg"
                  alt=""
                  width={13}
                  height={13}
                  className="rotate-90"
                />
              </div>
            </button>

            {/* Dropdown Action Menu */}
            {isUserMenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                aria-label="User account actions"
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl backdrop-blur-md z-50 transition-all duration-150 animate-in fade-in zoom-in-95"
              >
                {/* User Identity Info */}
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Avatar
                    firstName={currentUser.firstName}
                    lastName={currentUser.lastName}
                    size="sm"
                    colorScheme="blue"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">{currentUser.email}</p>
                    {currentUser.role && (
                      <div className="mt-1">
                        <Badge size="sm" variant={userRoleVariant}>
                          {currentUser.role}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="my-1.5 border-t border-slate-100" />

                {/* Change Password Menu Item */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleOpenChangePassword}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                >
                  <Image src="/icons/lock.svg" alt="" width={16} height={16} />
                  <span>{CHANGE_PASSWORD_CONSTANTS.actionMenuItemText}</span>
                </button>

                {/* Sign Out Menu Item */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleOpenLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                >
                  <Image src="/icons/logout-danger.svg" alt="" width={16} height={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
