'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, Pagination, Image, EmptyState, Select } from '@/components/ui';
import {
  useAppDispatch,
  useAppSelector,
  fetchNotifications,
  fetchUnreadCount,
  markAsReadThunk,
  markAllAsReadThunk,
  setNotificationsCurrentPage,
  setNotificationsLimit,
} from '@/store';
import { formatRelativeTime, formatDate, useDebounce, useMounted } from '@/helpers';
import { NotificationItem } from '@/types';
import {
  NOTIFICATION_READ_FILTER_OPTIONS,
  NOTIFICATION_TYPE_FILTER_OPTIONS,
  NOTIFICATION_TYPE_VISUALS,
  DEFAULT_NOTIFICATION_VISUAL,
  NOTIFICATIONS_CONSTANTS,
} from '@/constants';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const mounted = useMounted();
  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    items: notifications,
    unreadCount,
    totalItems,
    totalPages,
    currentPage,
    limit,
    isLoading,
    isActionLoading,
  } = useAppSelector((state) => state.notifications);

  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const debouncedSearch = useDebounce(searchInput, 350);

  // Fetch notifications
  const loadNotifications = useCallback(
    (page = currentPage, force = false) => {
      dispatch(
        fetchNotifications({
          page,
          limit,
          unreadOnly: readFilter === 'unread' ? true : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          forceRefresh: force,
        })
      );
      dispatch(fetchUnreadCount());
    },
    [dispatch, currentPage, limit, readFilter, typeFilter]
  );

  useEffect(() => {
    if (currentUser) {
      loadNotifications(currentPage);
    }
  }, [currentUser, currentPage, readFilter, typeFilter, loadNotifications]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setNotificationsCurrentPage(page));
    },
    [dispatch]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      dispatch(setNotificationsLimit(newLimit));
    },
    [dispatch]
  );

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

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      );
    }

    if (readFilter === 'unread') {
      result = result.filter((n) => !n.isRead);
    } else if (readFilter === 'read') {
      result = result.filter((n) => n.isRead);
    }

    if (typeFilter !== 'all') {
      result = result.filter((n) => n.type === typeFilter);
    }

    return result;
  }, [notifications, debouncedSearch, readFilter, typeFilter]);

  const getNotificationVisual = (type: string) =>
    NOTIFICATION_TYPE_VISUALS[type] ?? DEFAULT_NOTIFICATION_VISUAL;

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {NOTIFICATIONS_CONSTANTS.pageTitle}
            </h1>
            {unreadCount > 0 && (
              <Badge size="md" variant="danger">
                {unreadCount} {NOTIFICATIONS_CONSTANTS.unreadBadgeSuffix}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{NOTIFICATIONS_CONSTANTS.pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadNotifications(currentPage, true)}
            disabled={isLoading}
            leftIcon={
              <Image
                src="/icons/refresh.svg"
                alt=""
                width={15}
                height={15}
                className={isLoading ? 'animate-spin' : ''}
              />
            }
          >
            {isLoading
              ? NOTIFICATIONS_CONSTANTS.refreshingButtonText
              : NOTIFICATIONS_CONSTANTS.refreshButtonText}
          </Button>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="primary"
              onClick={handleMarkAllAsRead}
              disabled={isActionLoading}
              leftIcon={<Image src="/icons/check.svg" alt="" width={15} height={15} />}
            >
              {NOTIFICATIONS_CONSTANTS.markAllAsReadButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={NOTIFICATIONS_CONSTANTS.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Image src="/icons/search.svg" alt="" width={14} height={14} className="opacity-50" />
            </div>
          </div>

          <div className="w-36">
            <Select
              value={readFilter}
              onChange={(val) => setReadFilter(val as 'all' | 'unread' | 'read')}
              options={NOTIFICATION_READ_FILTER_OPTIONS}
            />
          </div>

          <div className="w-44">
            <Select
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              options={NOTIFICATION_TYPE_FILTER_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Notifications Feed Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Image
              src="/icons/logo-loader.svg"
              alt="Loading"
              width={32}
              height={32}
              className="animate-spin"
            />
            <p className="text-xs font-medium">{NOTIFICATIONS_CONSTANTS.loadingText}</p>
          </div>
        )}
        {!(isLoading && notifications.length === 0) && filteredNotifications.length === 0 && (
          <div className="py-12 px-4">
            <EmptyState
              title={NOTIFICATIONS_CONSTANTS.emptyState.title}
              description={
                searchInput || readFilter !== 'all' || typeFilter !== 'all'
                  ? NOTIFICATIONS_CONSTANTS.emptyState.filteredDescription
                  : NOTIFICATIONS_CONSTANTS.emptyState.defaultDescription
              }
              icon="/icons/bell.svg"
            />
          </div>
        )}
        {!(isLoading && notifications.length === 0) && filteredNotifications.length > 0 && (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification: NotificationItem) => {
              const visual = getNotificationVisual(notification.type);
              const isUnread = !notification.isRead;

              return (
                <button
                  type="button"
                  key={notification.notificationId || notification.id || notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 transition-all cursor-pointer hover:bg-slate-50/90 ${
                    isUnread ? 'bg-blue-50/30 font-medium' : 'bg-white'
                  }`}
                >
                  <span className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Event Icon Badge */}
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${visual.bg}`}
                    >
                      <Image src={visual.icon} alt="" width={18} height={18} />
                    </span>

                    {/* Content Details */}
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge size="sm" variant={visual.badgeVariant}>
                          {visual.label}
                        </Badge>
                        <span className="text-[11px] text-slate-400" suppressHydrationWarning>
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>

                      <span
                        className={`text-xs sm:text-sm ${
                          isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                        }`}
                      >
                        {notification.title}
                      </span>

                      <span className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notification.message}
                      </span>

                      {/* Actor & Exact Date Footer */}
                      <span className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        {notification.actor && (
                          <span>
                            Triggered by{' '}
                            <strong className="text-slate-600 font-semibold">
                              {notification.actor.firstName || notification.actor.name}{' '}
                              {notification.actor.lastName || ''}
                            </strong>
                          </span>
                        )}
                        <span>•</span>{' '}
                        <span suppressHydrationWarning>{formatDate(notification.createdAt)}</span>
                      </span>
                    </span>
                  </span>

                  {/* Status Indicator & Mark Read Button */}
                  <span className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isUnread ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-full">
                        <span
                          className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"
                          aria-hidden="true"
                        />{' '}
                        <span>Unread</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 px-2 py-1">Read</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="border-t border-slate-100 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
