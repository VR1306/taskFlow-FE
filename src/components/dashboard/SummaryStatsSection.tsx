import React from 'react';
import { StatCard } from './StatCard';
import { DashboardSummary } from '@/types';

export interface SummaryStatsSectionProps {
  summary: DashboardSummary;
}

export const SummaryStatsSection: React.FC<SummaryStatsSectionProps> = ({ summary }) => {
  const activeUserPercentage =
    summary.totalUsers > 0
      ? `${Math.round((summary.activeUsers / summary.totalUsers) * 100)}% Active`
      : '0% Active';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Users"
        value={summary.totalUsers}
        subtitle={`${summary.activeUsers} active · ${summary.inactiveUsers} inactive`}
        badgeText={activeUserPercentage}
        badgeVariant="success"
        iconBgColor="bg-blue-50 text-blue-600 border-blue-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      />

      <StatCard
        title="Active Accounts"
        value={summary.activeUsers}
        subtitle="Authorized team members"
        badgeText="Operational"
        badgeVariant="info"
        iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      <StatCard
        title="Security Roles"
        value={summary.totalRoles}
        subtitle={`${summary.systemRoles} system · ${summary.customRoles} custom`}
        badgeText={`${summary.activeRoles} Active`}
        badgeVariant="purple"
        iconBgColor="bg-purple-50 text-purple-600 border-purple-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
      />

      <StatCard
        title="System Permissions"
        value={summary.totalPermissions}
        subtitle="Granular security controls"
        badgeText="Configured"
        badgeVariant="slate"
        iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
      />
    </div>
  );
};
