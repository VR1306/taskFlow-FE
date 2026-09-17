'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Image, Avatar, Badge } from '@/components/ui';
import { useAppDispatch, toggleMobileSidebar } from '@/store';
import { useCurrentUser } from '@/helpers';

export const Header = memo(function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentUser = useCurrentUser();

  const handleToggleMobile = useCallback(() => {
    dispatch(toggleMobileSidebar());
  }, [dispatch]);

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

      {/* Right: User profile status pill (no duplicate Sign Out button) */}
      <div className="flex items-center gap-3">
        {currentUser && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-2.5 sm:px-3 py-1.5 shadow-2xs">
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
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
