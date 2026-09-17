'use client';

import React, { memo, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { UserRecord } from '@/store';
import { getRoleBadgeClass } from '@/helpers';

export interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
}

export const ViewUserModal = memo(function ViewUserModal({
  isOpen,
  onClose,
  user,
}: ViewUserModalProps) {
  const roleBadgeStyle = useMemo(() => {
    if (!user) return '';
    return getRoleBadgeClass(user.role);
  }, [user]);

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile Details"
      description="Detailed workspace profile and permissions overview."
      maxWidth="md"
    >
      <div className="space-y-5 pt-2">
        {/* User Card Header */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
          <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeStyle}`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* User Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Display User ID
            </span>
            <span className="font-mono text-sm font-bold text-blue-600">
              {user.userId || 'TF0001'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Account Status
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Member</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Database Object ID
            </span>
            <span className="font-mono text-xs text-slate-600 break-all select-all">
              {user._id}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Registered Date
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Workspace Default'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-semibold text-slate-700"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ViewUserModal.displayName = 'ViewUserModal';

export default ViewUserModal;
