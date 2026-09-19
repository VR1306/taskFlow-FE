import React, { useState } from 'react';
import Link from 'next/link';
import { BarChart, BarChartItem } from '@/components/charts';
import { RegistrationTrendItem, RolePermissionItem } from '@/types';

export interface WorkspaceTrendsCardProps {
  userRegistrationTrends?: RegistrationTrendItem[];
  rolePermissionsDistribution?: RolePermissionItem[];
}

export const WorkspaceTrendsCard: React.FC<WorkspaceTrendsCardProps> = ({
  userRegistrationTrends = [],
  rolePermissionsDistribution = [],
}) => {
  const [barTab, setBarTab] = useState<'trends' | 'permissions'>('trends');

  const barTrendsData: BarChartItem[] = userRegistrationTrends.map((t) => ({
    label: t.month,
    value: t.count,
    subLabel: `${t.year}`,
    color: '#3b82f6',
  }));

  const barPermissionsData: BarChartItem[] = rolePermissionsDistribution.map((r) => ({
    label: r.roleName,
    value: r.permissionsCount,
    secondaryValue: r.usersCount,
    color: '#6366f1',
    secondaryColor: '#10b981',
  }));

  return (
    <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Workspace Activity & Trends</h2>
            <p className="text-xs text-slate-500">
              {barTab === 'trends'
                ? 'Monthly user registration trend analysis'
                : 'Granted permissions vs assigned members per role'}
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setBarTab('trends')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                barTab === 'trends'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrations
            </button>
            <button
              type="button"
              onClick={() => setBarTab('permissions')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                barTab === 'permissions'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Role Permissions
            </button>
          </div>
        </div>

        <div className="py-2">
          {barTab === 'trends' ? (
            <BarChart data={barTrendsData} valueLabel="New Users" height={215} />
          ) : (
            <BarChart
              data={barPermissionsData}
              valueLabel="Permissions"
              secondaryLabel="Assigned Users"
              height={215}
            />
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          {barTab === 'trends'
            ? 'Showing 6 months trailing trajectory'
            : 'Comparison of role capability coverage'}
        </span>
        <Link
          href="/users"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Manage Users &rarr;
        </Link>
      </div>
    </div>
  );
};
