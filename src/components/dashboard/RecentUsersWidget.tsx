import React from 'react';
import Link from 'next/link';
import { Avatar, Badge, EmptyState } from '@/components/ui';
import { RecentUserItem } from '@/types';

export interface RecentUsersWidgetProps {
  users?: RecentUserItem[];
}

export const RecentUsersWidget: React.FC<RecentUsersWidgetProps> = ({ users = [] }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Members</h2>
            <p className="text-xs text-slate-500">Newly registered accounts</p>
          </div>
        </div>

        <Link
          href="/users"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View All &rarr;
        </Link>
      </div>

      {users.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <div
              key={user.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  firstName={user.name.split(' ')[0] || ''}
                  lastName={user.name.split(' ').slice(1).join(' ') || ''}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={user.role === 'SuperAdmin' ? 'purple' : 'info'} size="sm">
                  {user.role}
                </Badge>
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.isActive ? 'bg-emerald-500' : 'bg-red-400'
                  }`}
                  title={user.isActive ? 'Active' : 'Inactive'}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          variant="no-data"
          size="sm"
          title="No Recent Members"
          description="No new team accounts have registered recently."
          className="py-6"
        />
      )}
    </div>
  );
};
