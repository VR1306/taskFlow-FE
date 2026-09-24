'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/helpers';
import { useAppDispatch, useAppSelector, fetchDashboardStats } from '@/store';
import { ErrorMessage, EmptyState } from '@/components/ui';
import {
  DashboardHeader,
  DashboardSkeleton,
  SummaryStatsSection,
  UserDistributionCard,
  WorkspaceTrendsCard,
  RecentUsersWidget,
  RecentRolesWidget,
} from '@/components/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useCurrentUser();
  const { stats, isLoading, isRefreshing, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats(false));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardStats(true));
  };

  const hasNoData =
    !isLoading &&
    (!stats ||
      (stats.summary.totalUsers === 0 &&
        stats.summary.totalRoles === 0 &&
        stats.summary.totalPermissions === 0));

  const renderDashboardContent = () => {
    if (isLoading && !stats) {
      return <DashboardSkeleton />;
    }

    if (hasNoData) {
      return (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-xs">
          <EmptyState
            variant="no-data"
            size="md"
            title="No Workspace Data Found"
            description="Your workspace does not have any active members, security roles, or analytics recorded yet."
            actionText="Manage Users"
            onAction={() => router.push('/users')}
            secondaryActionText="Configure Roles"
            onSecondaryAction={() => router.push('/roles')}
          />
        </div>
      );
    }

    return (
      <>
        {/*
          `stats` is guaranteed to be non-null here: reaching this branch requires
          `hasNoData` to be false, which (given the guards above) is only possible
          when `stats` is truthy. The non-null assertion documents that invariant
          without introducing an unreachable fallback branch.
        */}
        <SummaryStatsSection summary={stats!.summary} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <UserDistributionCard
            usersByRole={stats?.usersByRole}
            usersByStatus={stats?.usersByStatus}
          />
          <WorkspaceTrendsCard
            userRegistrationTrends={stats?.userRegistrationTrends}
            rolePermissionsDistribution={stats?.rolePermissionsDistribution}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentUsersWidget users={stats?.recentUsers} />
          <RecentRolesWidget roles={stats?.recentRoles} />
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        userName={currentUser?.firstName}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {error && (
        <ErrorMessage message={error} className="bg-red-50/80 border-red-200 p-2.5 rounded-xl" />
      )}

      {renderDashboardContent()}
    </div>
  );
}
