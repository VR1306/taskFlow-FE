'use client';

import React, { useEffect } from 'react';
import { useCurrentUser } from '@/helpers';
import { useAppDispatch, useAppSelector, fetchDashboardStats } from '@/store';
import { Loader, ErrorMessage } from '@/components/ui';
import {
  DashboardHeader,
  SummaryStatsSection,
  UserDistributionCard,
  WorkspaceTrendsCard,
  RecentUsersWidget,
  RecentRolesWidget,
} from '@/components/dashboard';

const DEFAULT_SUMMARY = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalRoles: 0,
  systemRoles: 0,
  customRoles: 0,
  activeRoles: 0,
  totalPermissions: 0,
};

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const currentUser = useCurrentUser();
  const { stats, isLoading, isRefreshing, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats(false));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardStats(true));
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

      {isLoading && !stats ? (
        <div className="py-12">
          <Loader text="Loading live workspace analytics and metrics..." />
        </div>
      ) : (
        <>
          <SummaryStatsSection summary={stats?.summary || DEFAULT_SUMMARY} />

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
      )}
    </div>
  );
}
