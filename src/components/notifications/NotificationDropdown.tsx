'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image, Badge } from '@/components/ui';
import {
  useAppDispatch,
  useAppSelector,
  fetchNotifications,
  fetchUnreadCount,
  markAsReadThunk,
  markAllAsReadThunk,
} from '@/store';
import { formatRelativeTime, useMounted } from '@/helpers';
import { NotificationItem } from '@/types';
import { NOTIFICATION_TYPE_VISUALS, DEFAULT_NOTIFICATION_VISUAL } from '@/constants';

export const NotificationDropdown = memo(function NotificationDropdown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const mounted = useMounted();
  const notifState = useAppSelector((state) => state.notifications);
  const items = useMemo(() => notifState?.items ?? [], [notifState?.items]);
  const unreadCount = notifState?.unreadCount ?? 0;
  const isLoading = notifState?.isLoading ?? false;
  const currentUser = useAppSelector((state) => state.auth?.user);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial fetch of unread count and notifications on mount
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [dispatch, currentUser]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Fetch latest notifications when dropdown opens
  useEffect(() => {
    if (isOpen && currentUser) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
      dispatch(fetchUnreadCount());
    }
  }, [isOpen, currentUser, dispatch]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleMarkAsRead = useCallback(
    (notificationId: string, isRead: boolean) => {
      if (!isRead) {
        dispatch(markAsReadThunk(notificationId));
      }
    },
    [dispatch]
  );

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      handleMarkAsRead(notification.notificationId, notification.isRead);
      if (notification.link) {
        setIsOpen(false);
        router.push(notification.link);
      }
    },
    [handleMarkAsRead, router]
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount > 0) {
      dispatch(markAllAsReadThunk());
    }
  }, [dispatch, unreadCount]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'unread') {
      return items.filter((n) => !n.isRead);
    }
    return items;
  }, [items, activeTab]);

  const getNotificationIcon = (type: string) =>
    NOTIFICATION_TYPE_VISUALS[type] ?? DEFAULT_NOTIFICATION_VISUAL;

  if (!mounted || !currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
          isOpen
            ? 'border-blue-400 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/20'
            : 'border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs'
        }`}
      >
        <Image src="/icons/bell.svg" alt="Notifications" width={18} height={18} />

        {unreadCount > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse ring-2 ring-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <dialog
          open
          aria-label="Notifications dropdown"
          className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-2xl border border-slate-200/90 bg-white/98 p-0 shadow-2xl backdrop-blur-md z-50 transition-all duration-150 animate-in fade-in zoom-in-95 overflow-hidden flex flex-col max-h-[calc(100vh-5rem)] sm:max-h-[520px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
              {unreadCount > 0 && (
                <Badge size="sm" variant="danger">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 px-4 pt-2 gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'unread'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="inline-block rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] text-blue-700 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[min(340px,calc(100vh-14rem))]">
            {isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <Image
                  src="/icons/logo-loader.svg"
                  alt="Loading"
                  width={28}
                  height={28}
                  className="animate-spin"
                />
                <p className="text-xs">Loading notifications...</p>
              </div>
            )}
            {!(isLoading && items.length === 0) && filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <Image
                    src="/icons/bell.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="opacity-40"
                  />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeTab === 'unread'
                    ? "You've read all your notifications."
                    : 'Activity and updates will appear here.'}
                </p>
              </div>
            )}
            {!(isLoading && items.length === 0) &&
              filteredItems.length > 0 &&
              filteredItems.map((notification: NotificationItem) => {
                const iconConfig = getNotificationIcon(notification.type);
                return (
                  <button
                    type="button"
                    key={notification.notificationId || notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50/80 ${
                      !notification.isRead ? 'bg-blue-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Icon */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-1.5 ${iconConfig.bg}`}
                    >
                      <Image src={iconConfig.icon} alt="" width={14} height={14} />
                    </span>

                    {/* Content */}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs ${
                            !notification.isRead
                              ? 'font-bold text-slate-900'
                              : 'font-semibold text-slate-700'
                          } truncate`}
                        >
                          {notification.title}
                        </span>
                        <span
                          className="text-[10px] text-slate-400 shrink-0"
                          suppressHydrationWarning
                        >
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>

                      <span className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed break-words">
                        {notification.message}
                      </span>

                      <span className="flex flex-wrap items-center gap-2 mt-1.5">
                        {notification.actor?.firstName && (
                          <span className="text-[10px] text-slate-400">
                            By {notification.actor.firstName} {notification.actor.lastName || ''}
                          </span>
                        )}
                      </span>
                    </span>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Footer View All */}
          <div className="border-t border-slate-100 bg-slate-50/60 p-2 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-xl py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50/80 hover:text-blue-700 transition-colors"
            >
              View All Notifications
            </Link>
          </div>
        </dialog>
      )}
    </div>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;
