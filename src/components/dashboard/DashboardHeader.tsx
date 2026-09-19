import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export interface DashboardHeaderProps {
  userName?: string;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = 'User',
  isLoading,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-sm relative overflow-hidden">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Workspace Analytics
            </span>
            <span className="text-xs text-slate-400">● Live Real-Time Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Manage organization members, monitor security roles, inspect granular permissions, and
            track workspace growth metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh Data"
            className="h-11 px-4 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 hover:border-white/35 backdrop-blur-md transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <svg
              className={`w-4 h-4 text-blue-300 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <Link href="/users">
            <Button variant="primary" size="md" className="cursor-pointer">
              Manage Users &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
