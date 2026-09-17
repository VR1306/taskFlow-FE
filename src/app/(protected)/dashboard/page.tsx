'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authStorage } from '@/helpers';
import { AuthUser } from '@/types';
import { Button } from '@/components/ui';

export default function DashboardPage() {
  const [currentUser] = useState<AuthUser | null>(() => authStorage.getUser());

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            TaskFlow Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {currentUser?.firstName || 'User'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            You are logged into TaskFlow. Your account default module is configured for Users
            management.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/users">
              <Button variant="primary" size="md">
                Go to Users Module &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Users Directory</h2>
          <p className="text-sm text-slate-500 mb-4">
            View system members, roles, and user access levels.
          </p>
          <Link
            href="/users"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Manage Users &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Session & Authentication</h2>
          <p className="text-sm text-slate-500 mb-4">
            Active JWT session protected with Access Token and transparent Refresh Token rotation.
          </p>
          <span className="inline-flex items-center text-xs font-medium text-emerald-600">
            ● Active Protected Session
          </span>
        </div>
      </div>
    </div>
  );
}
