'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image, Button } from '@/components/ui';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

/**
 * Shown in place of a protected route's content when the logged-in user lacks the
 * permission that route requires — e.g. navigating directly to /users by URL without
 * users.view. The sidebar/header stay mounted around it so the user can still navigate
 * to a module they do have access to.
 */
export const AccessDenied = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center select-none animate-in fade-in zoom-in-95 duration-300">
      <div className="relative my-4 flex items-center justify-center">
        <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/80 shadow-xs">
          <Image src="/icons/lock.svg" alt="" width={48} height={48} />
        </div>
        <span className="absolute -top-2 -right-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm shadow-rose-500/30">
          {ERROR_PAGES_CONSTANTS.accessDenied.badge}
        </span>
      </div>

      <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        {ERROR_PAGES_CONSTANTS.accessDenied.title}
      </h1>
      <p className="mt-2 max-w-md text-sm sm:text-base text-slate-500">
        {ERROR_PAGES_CONSTANTS.accessDenied.description}
      </p>

      <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.back()}
          leftIcon={<Image src="/icons/chevron-left.svg" alt="" width={16} height={16} />}
          className="w-full sm:w-auto cursor-pointer text-sm font-semibold"
        >
          {ERROR_PAGES_CONSTANTS.accessDenied.backButtonText}
        </Button>

        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={
              <Image
                src="/icons/dashboard.svg"
                alt=""
                width={16}
                height={16}
                className="brightness-0 invert"
              />
            }
            className="w-full cursor-pointer text-sm font-semibold shadow-md shadow-blue-500/20 sm:w-auto"
          >
            {ERROR_PAGES_CONSTANTS.accessDenied.dashboardButtonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

AccessDenied.displayName = 'AccessDenied';

export default AccessDenied;
