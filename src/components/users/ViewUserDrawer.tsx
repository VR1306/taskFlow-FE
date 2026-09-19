'use client';

import React, { memo, useState, useCallback } from 'react';
import { Drawer, Button, Avatar, Badge, Image } from '@/components/ui';
import { UserRecord } from '@/store';
import { formatDate } from '@/helpers';
import { USERS_CONSTANTS } from '@/constants';

export interface ViewUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: UserRecord) => void;
  user: UserRecord | null;
}

export const ViewUserDrawer = memo(function ViewUserDrawer({
  isOpen,
  onClose,
  onEdit,
  user,
}: ViewUserDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleEditClick = useCallback(() => {
    if (user && onEdit) {
      onClose();
      onEdit(user);
    }
  }, [user, onEdit, onClose]);

  const footerContent = (
    <div className="flex w-full items-center justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="text-xs font-semibold py-2.5 px-4"
      >
        {USERS_CONSTANTS.viewDrawer.closeButtonText}
      </Button>
      {onEdit && (
        <Button
          type="button"
          variant="primary"
          onClick={handleEditClick}
          leftIcon={<Image src="/icons/edit-white.svg" alt="" width={15} height={15} />}
          className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 py-2.5 px-4"
        >
          {USERS_CONSTANTS.viewDrawer.editButtonText}
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={USERS_CONSTANTS.viewDrawer.title}
      description={USERS_CONSTANTS.viewDrawer.description}
      footer={footerContent}
      width="md"
    >
      {user && (
        <div className="space-y-6">
          {/* Member Profile Banner Card */}
          <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5 lowercase">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={user.role === 'SuperAdmin' ? 'purple' : 'primary'}>
                  {user.role}
                </Badge>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    user.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      user.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {user.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Sequential User Details (One by One) */}
          <div className="space-y-4 divide-y divide-slate-100">
            {/* 1. Sequential Display User ID */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {USERS_CONSTANTS.viewDrawer.displayIdLabel}
              </span>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2.5">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {user.userId || 'TF0001'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.userId || 'TF0001', 'userId')}
                  className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  {copiedField === 'userId'
                    ? USERS_CONSTANTS.viewDrawer.copied
                    : USERS_CONSTANTS.viewDrawer.copyId}
                </button>
              </div>
            </div>

            {/* 2. Work Email */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {USERS_CONSTANTS.viewDrawer.emailLabel}
              </span>
              <p className="text-sm font-semibold text-slate-800 px-1 lowercase">{user.email}</p>
            </div>

            {/* 3. Assigned Role */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {USERS_CONSTANTS.viewDrawer.roleLabel}
              </span>
              <p className="text-sm font-semibold text-slate-800 px-1">{user.role}</p>
            </div>

            {/* 4. Account Status */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {USERS_CONSTANTS.viewDrawer.statusLabel}
              </span>
              <p className="text-sm font-semibold text-slate-800 px-1">
                {user.isActive !== false
                  ? USERS_CONSTANTS.viewDrawer.activeStatus
                  : USERS_CONSTANTS.viewDrawer.inactiveStatus}
              </p>
            </div>

            {/* 5. Joined Date */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {USERS_CONSTANTS.viewDrawer.joinedLabel}
              </span>
              <p className="text-sm font-semibold text-slate-800 px-1" suppressHydrationWarning>
                {user.createdAt
                  ? formatDate(user.createdAt)
                  : USERS_CONSTANTS.viewDrawer.notAvailable}
              </p>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
});

ViewUserDrawer.displayName = 'ViewUserDrawer';
