import React, { useState } from 'react';
import Link from 'next/link';
import { PieChart, PieChartItem } from '@/components/charts';
import { RoleDistributionItem, StatusDistributionItem } from '@/types';

export interface UserDistributionCardProps {
  usersByRole?: RoleDistributionItem[];
  usersByStatus?: StatusDistributionItem[];
}

export const UserDistributionCard: React.FC<UserDistributionCardProps> = ({
  usersByRole = [],
  usersByStatus = [],
}) => {
  const [pieTab, setPieTab] = useState<'role' | 'status'>('role');

  const pieData: PieChartItem[] =
    pieTab === 'role'
      ? usersByRole
      : usersByStatus.map((item) => ({
          label: item.status,
          count: item.count,
          percentage: item.percentage,
          color: item.color,
        }));

  return (
    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Distribution</h2>
            <p className="text-xs text-slate-500">Breakdown of workspace members</p>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setPieTab('role')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                pieTab === 'role'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Role
            </button>
            <button
              type="button"
              onClick={() => setPieTab('status')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                pieTab === 'status'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Status
            </button>
          </div>
        </div>

        <div className="py-2 flex justify-center">
          <PieChart
            data={pieData}
            totalLabel={pieTab === 'role' ? 'Roles' : 'Users'}
            size={210}
            innerRadiusRatio={0.62}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Interactive hover insights enabled</span>
        <Link
          href="/roles"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View Roles &rarr;
        </Link>
      </div>
    </div>
  );
};
