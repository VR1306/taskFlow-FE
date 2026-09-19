import React from 'react';
import Link from 'next/link';
import { Badge, EmptyState } from '@/components/ui';
import { RecentRoleItem } from '@/types';

export interface RecentRolesWidgetProps {
  roles?: RecentRoleItem[];
}

export const RecentRolesWidget: React.FC<RecentRolesWidgetProps> = ({ roles = [] }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Access Roles</h2>
            <p className="text-xs text-slate-500">Configured security levels</p>
          </div>
        </div>

        <Link
          href="/roles"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Manage Roles &rarr;
        </Link>
      </div>

      {roles.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {roles.map((role) => (
            <div
              key={role.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">{role.name}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{role.roleId}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {role.permissionsCount} permissions enabled
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={role.isSystem ? 'default' : 'warning'} size="sm">
                  {role.isSystem ? 'System' : 'Custom'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          variant="no-data"
          size="sm"
          title="No Configured Roles"
          description="No security roles have been created in this workspace."
          className="py-6"
        />
      )}
    </div>
  );
};
