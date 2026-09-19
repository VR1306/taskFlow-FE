'use client';

import React, { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Image, Badge, Avatar } from '@/components/ui';
import {
  useAppDispatch,
  useAppSelector,
  toggleSidebar,
  setMobileSidebarOpen,
  openLogoutModal,
} from '@/store';
import { useCurrentUser, hasPermission, useMounted } from '@/helpers';

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  requiredPermission?: string | string[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '/icons/dashboard.svg',
  },
  {
    name: 'User Management',
    href: '/users',
    icon: '/icons/users.svg',
    requiredPermission: ['users.view', '*'],
  },
  {
    name: 'Role Management',
    href: '/roles',
    icon: '/icons/shield-check.svg',
    requiredPermission: ['roles.view', '*'],
  },
];

interface SidebarUserFooterProps {
  currentUser: ReturnType<typeof useCurrentUser>;
  mounted: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  userRoleVariant: 'purple' | 'primary' | 'default';
  onLogout: () => void;
}

const SidebarUserFooter = memo(function SidebarUserFooter({
  currentUser,
  mounted,
  isCollapsed,
  isMobileOpen,
  userRoleVariant,
  onLogout,
}: SidebarUserFooterProps) {
  if (isCollapsed && !isMobileOpen) {
    return (
      <div className="flex flex-col items-center gap-2 py-1">
        <Avatar
          firstName={mounted ? currentUser?.firstName : undefined}
          lastName={mounted ? currentUser?.lastName : undefined}
          size="sm"
          colorScheme="blue"
        />
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign out"
          title="Sign out of TaskFlow"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-2xs"
        >
          <Image src="/icons/logout-danger.svg" alt="Sign Out" width={15} height={15} />
        </button>
      </div>
    );
  }

  const displayName =
    mounted && currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User Account';
  const displayEmail = mounted && currentUser?.email ? currentUser.email : '';

  return (
    <div className="flex items-center justify-between gap-2.5 rounded-xl p-2.5 bg-white border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Avatar
          firstName={mounted ? currentUser?.firstName : undefined}
          lastName={mounted ? currentUser?.lastName : undefined}
          size="sm"
          colorScheme="blue"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
          <p className="truncate text-[11px] text-slate-500">{displayEmail}</p>
          {mounted && currentUser?.role && (
            <div className="mt-1">
              <Badge size="sm" variant={userRoleVariant}>
                {currentUser.role}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        aria-label="Sign out"
        title="Sign out of TaskFlow"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-2xs"
      >
        <Image src="/icons/logout-danger.svg" alt="Sign Out" width={16} height={16} />
      </button>
    </div>
  );
});

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const isMobileOpen = useAppSelector((state) => state.ui.mobileSidebarOpen);
  const reduxUser = useAppSelector((state) => state.auth.user);
  const storageUser = useCurrentUser();
  const currentUser = reduxUser || storageUser;
  const mounted = useMounted();

  const handleToggleCollapse = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleCloseMobile = useCallback(() => {
    dispatch(setMobileSidebarOpen(false));
  }, [dispatch]);

  const handleOpenLogout = useCallback(() => {
    dispatch(openLogoutModal());
  }, [dispatch]);

  const isItemActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') return pathname === '/dashboard';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const userRoleVariant = useMemo<'purple' | 'primary' | 'default'>(() => {
    switch (currentUser?.role) {
      case 'SuperAdmin':
        return 'purple';
      case 'Admin':
        return 'primary';
      default:
        return 'default';
    }
  }, [currentUser?.role]);

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.requiredPermission) return true;
      if (!mounted) return true;
      return hasPermission(currentUser, item.requiredPermission);
    });
  }, [currentUser, mounted]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity duration-300 w-full h-full border-none cursor-default"
          onClick={handleCloseMobile}
          data-testid="mobile-sidebar-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/90 shadow-xs transition-all duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        {/* Overlapping Expand/Collapse Arrow Button on Sidebar Right Border */}
        <button
          type="button"
          onClick={handleToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex absolute -right-3.5 top-5.5 z-50 h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 text-slate-700"
        >
          <Image
            src={isCollapsed ? '/icons/chevron-right.svg' : '/icons/chevron-left.svg'}
            alt=""
            width={14}
            height={14}
          />
        </button>

        {/* Logo Header */}
        <div
          className={`flex h-16 items-center border-b border-slate-100 ${
            isCollapsed && !isMobileOpen ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <Link
            href="/users"
            className="flex items-center gap-2.5 group overflow-hidden"
            onClick={handleCloseMobile}
            title="TaskFlow"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-xs p-1.5 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/icons/logo.svg"
                alt="TaskFlow Logo"
                width={24}
                height={24}
                loading="eager"
              />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <span className="text-xl font-bold tracking-tight text-slate-900 transition-opacity duration-200">
                TaskFlow
              </span>
            )}
          </Link>

          {isMobileOpen && (
            <button
              type="button"
              onClick={handleCloseMobile}
              aria-label="Close mobile menu"
              className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Image src="/icons/close.svg" alt="" width={16} height={16} />
            </button>
          )}
        </div>

        {/* Module Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Modules & Apps
            </div>
          )}

          <nav className="space-y-1.5" aria-label="Sidebar Navigation">
            {visibleNavItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleCloseMobile}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                  title={isCollapsed && !isMobileOpen ? item.name : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-600" />
                  )}

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={18}
                      height={18}
                      className={active ? 'brightness-0 saturate-100' : ''}
                    />
                  </div>

                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex flex-1 items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <Badge
                          size="sm"
                          variant={active ? 'primary' : 'default'}
                          className="text-[10px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card & Sign Out Footer */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/60">
          <SidebarUserFooter
            currentUser={currentUser}
            mounted={mounted}
            isCollapsed={isCollapsed}
            isMobileOpen={isMobileOpen}
            userRoleVariant={userRoleVariant}
            onLogout={handleOpenLogout}
          />
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
