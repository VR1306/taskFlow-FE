'use client';

import React, { useEffect } from 'react';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Crash:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 mx-auto flex items-center justify-center text-rose-600 mb-4 text-2xl font-bold">
            !
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 mb-3">
            {ERROR_PAGES_CONSTANTS.globalError.badge}
          </span>

          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {ERROR_PAGES_CONSTANTS.globalError.title}
          </h1>

          <p className="text-xs text-slate-500 mb-6">
            {error.message || ERROR_PAGES_CONSTANTS.globalError.description}
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md transition-colors cursor-pointer"
          >
            {ERROR_PAGES_CONSTANTS.globalError.reloadButtonText}
          </button>
        </div>
      </body>
    </html>
  );
}
