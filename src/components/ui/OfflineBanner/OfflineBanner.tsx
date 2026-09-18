'use client';

import React, { memo, useState, useEffect, useCallback } from 'react';
import { Image, Button } from '@/components/ui';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

export interface OfflineBannerProps {
  className?: string;
  autoHideDurationMs?: number;
}

export const OfflineBanner = memo(function OfflineBanner({
  className = '',
  autoHideDurationMs = 3500,
}: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide the "Connection restored" notice after duration
  useEffect(() => {
    if (!showRestoredNotice) return;
    const timer = setTimeout(() => {
      setShowRestoredNotice(false);
    }, autoHideDurationMs);
    return () => clearTimeout(timer);
  }, [showRestoredNotice, autoHideDurationMs]);

  const handleManualCheck = useCallback(() => {
    setIsChecking(true);
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setShowRestoredNotice(true);
      }
    }
    setTimeout(() => {
      setIsChecking(false);
    }, 600);
  }, []);

  if (!mounted) return null;
  if (isOnline && !showRestoredNotice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[calc(100%-2rem)] transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${className}`}
    >
      {/* Offline Alert View */}
      {!isOnline && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-slate-700/80">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate">
                {ERROR_PAGES_CONSTANTS.offline.title}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                {ERROR_PAGES_CONSTANTS.offline.bannerText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualCheck}
              isLoading={isChecking}
              className="text-xs font-semibold text-white border-slate-700 hover:bg-slate-800 hover:border-slate-600 cursor-pointer"
            >
              {ERROR_PAGES_CONSTANTS.offline.retryButtonText}
            </Button>
          </div>
        </div>
      )}

      {/* Online Restored Notification View */}
      {isOnline && showRestoredNotice && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-900/95 text-white shadow-xl backdrop-blur-md border border-emerald-700/80 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Image
                src="/icons/check.svg"
                alt=""
                width={12}
                height={12}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-xs sm:text-sm font-semibold">
              {ERROR_PAGES_CONSTANTS.offline.restoredText}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRestoredNotice(false)}
            className="text-emerald-300 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss notice"
          >
            <Image
              src="/icons/close.svg"
              alt=""
              width={14}
              height={14}
              className="brightness-0 invert opacity-75 hover:opacity-100"
            />
          </button>
        </div>
      )}
    </div>
  );
});

OfflineBanner.displayName = 'OfflineBanner';

export default OfflineBanner;
