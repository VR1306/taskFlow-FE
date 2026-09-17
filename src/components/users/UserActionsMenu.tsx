'use client';

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Image } from '@/components/ui';
import { UserRecord } from '@/store';

export interface UserActionsMenuProps {
  user: UserRecord;
  onView: (user: UserRecord) => void;
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
}

export const UserActionsMenu = memo(function UserActionsMenu({
  user,
  onView,
  onEdit,
  onDelete,
}: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Click outside and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleClose();
      onView(user);
    },
    [handleClose, onView, user]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleClose();
      onEdit(user);
    },
    [handleClose, onEdit, user]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleClose();
      onDelete(user);
    },
    [handleClose, onDelete, user]
  );

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* 3-dots Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Actions for ${user.firstName} ${user.lastName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/70 transition-all duration-150 cursor-pointer shadow-2xs"
      >
        <Image src="/icons/more-vertical.svg" alt="Actions" width={16} height={16} />
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-lg backdrop-blur-md transition-all duration-200 animate-fadeIn"
        >
          {/* View Details */}
          <button
            type="button"
            role="menuitem"
            onClick={handleView}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-left"
          >
            <Image src="/icons/eye.svg" alt="" width={15} height={15} />
            <span>View Details</span>
          </button>

          {/* Edit User */}
          <button
            type="button"
            role="menuitem"
            onClick={handleEdit}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-left"
          >
            <Image src="/icons/edit.svg" alt="" width={15} height={15} />
            <span>Edit User</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* Delete User (Soft delete) */}
          <button
            type="button"
            role="menuitem"
            onClick={handleDelete}
            disabled={user.role === 'SuperAdmin'}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none text-left"
          >
            <Image src="/icons/trash.svg" alt="" width={15} height={15} />
            <span>Delete User</span>
          </button>
        </div>
      )}
    </div>
  );
});

UserActionsMenu.displayName = 'UserActionsMenu';

export default UserActionsMenu;
