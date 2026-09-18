'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image, Button } from '@/components/ui';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-12 select-none">
      <div className="w-full max-w-lg text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Logo Header */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200/80 shadow-xs p-2">
            <Image
              src="/icons/logo.svg"
              alt="TaskFlow Logo"
              width={28}
              height={28}
              loading="eager"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</span>
        </div>

        {/* 404 Visual Illustration Card */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shadow-xs">
            <Image
              src="/icons/compass-404.svg"
              alt="404 Compass"
              width={56}
              height={56}
              className="text-blue-600 opacity-90"
            />
          </div>
          <span className="absolute -top-2 -right-3 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-sm shadow-blue-500/30">
            {ERROR_PAGES_CONSTANTS.notFound.badge}
          </span>
        </div>

        {/* Headings */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {ERROR_PAGES_CONSTANTS.notFound.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-md">
          {ERROR_PAGES_CONSTANTS.notFound.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => router.back()}
            leftIcon={<Image src="/icons/chevron-left.svg" alt="" width={16} height={16} />}
            className="w-full sm:w-auto font-semibold text-sm cursor-pointer"
          >
            {ERROR_PAGES_CONSTANTS.notFound.backButtonText}
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
              className="w-full sm:w-auto font-semibold text-sm shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {ERROR_PAGES_CONSTANTS.notFound.dashboardButtonText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
