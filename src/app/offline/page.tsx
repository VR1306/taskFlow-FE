'use client';

import React, { useState, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Image, Button } from '@/components/ui';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerSnapshot);

  const handleCheckConnection = useCallback(() => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
    }, 700);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-12 select-none">
      <div className="w-full max-w-lg text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200/80 shadow-xs p-2">
            <Image src="/icons/logo.svg" alt="TaskFlow Logo" width={28} height={28} priority />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</span>
        </div>

        {/* Offline Icon Illustration */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-50/90 border border-amber-100 flex items-center justify-center shadow-xs">
            <Image
              src="/icons/wifi-off.svg"
              alt="Offline"
              width={52}
              height={52}
              className="text-amber-600 opacity-90"
            />
          </div>
          <span className="absolute -top-2 -right-3 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-sm shadow-amber-500/30">
            {ERROR_PAGES_CONSTANTS.offline.badge}
          </span>
        </div>

        {/* Headings */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {isOnline
            ? ERROR_PAGES_CONSTANTS.offline.restoredText
            : ERROR_PAGES_CONSTANTS.offline.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-md">
          {isOnline
            ? 'Your connection has been restored. You can now return to your workspace.'
            : ERROR_PAGES_CONSTANTS.offline.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          {!isOnline ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleCheckConnection}
              isLoading={isChecking}
              leftIcon={
                <Image
                  src="/icons/refresh.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="brightness-0 invert"
                />
              }
              className="w-full sm:w-auto font-semibold text-sm shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {ERROR_PAGES_CONSTANTS.offline.retryButtonText}
            </Button>
          ) : (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full sm:w-auto font-semibold text-sm shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {ERROR_PAGES_CONSTANTS.offline.dashboardButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
