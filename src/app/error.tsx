'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Image, Button } from '@/components/ui';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring services if available
    console.error('Unhandled segment error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Error Icon Illustration */}
        <div className="w-18 h-18 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-5 shadow-xs">
          <Image
            src="/icons/server-error.svg"
            alt=""
            width={38}
            height={38}
            className="text-rose-600"
          />
        </div>

        {/* Badge */}
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 mb-3">
          {ERROR_PAGES_CONSTANTS.serverError.badge}
        </span>

        {/* Headings */}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {ERROR_PAGES_CONSTANTS.serverError.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          {error.message || ERROR_PAGES_CONSTANTS.serverError.description}
        </p>

        {error.digest && (
          <p className="mt-2 text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
            Error Reference: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={
              <Image
                src="/icons/refresh.svg"
                alt=""
                width={15}
                height={15}
                className="brightness-0 invert"
              />
            }
            className="font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {ERROR_PAGES_CONSTANTS.serverError.retryButtonText}
          </Button>

          <Link href="/dashboard">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="font-semibold text-xs sm:text-sm cursor-pointer"
            >
              {ERROR_PAGES_CONSTANTS.serverError.dashboardButtonText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
