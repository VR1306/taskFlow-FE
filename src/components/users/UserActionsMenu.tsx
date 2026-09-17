'use client';

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Image } from '@/components/ui';
import { UserRecord } from '@/store';
import { USERS_CONSTANTS } from '@/constants';

export interface UserActionsMenuProps {
  user: UserRecord;
  onView: (user: UserRecord) => void;
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
}

interface MenuCoords {
  top: number;
  left: number;
  isAbove: boolean;
}

export const UserActionsMenu = memo(function UserActionsMenu({
  user,
  onView,
  onEdit,
  onDelete,
}: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 138;
    const padding = 6;

    // Check if menu fits below the trigger button
    const fitsBelow = rect.bottom + menuHeight + padding <= window.innerHeight;
    const isAbove = !fitsBelow && rect.top - menuHeight - padding >= 0;

    const top = isAbove ? rect.top - menuHeight - padding : rect.bottom + padding;

    // Align right edge of menu with right edge of button, but keep inside viewport
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left, isAbove });
  }, []);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen((prev) => {
        if (!prev) {
          updatePosition();
        }
        return !prev;
      });
    },
    [updatePosition]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for outside click, resize, scroll, and escape key
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

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

  const dropdownMenu = isOpen && coords && mounted && (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: '180px',
        zIndex: 9999,
      }}
      className="rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95"
    >
      {/* View Details */}
      <button
        type="button"
        role="menuitem"
        onClick={handleView}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-left"
      >
        <Image src="/icons/eye.svg" alt="" width={15} height={15} />
        <span>{USERS_CONSTANTS.actionsMenu.viewDetails}</span>
      </button>

      {/* Edit User */}
      <button
        type="button"
        role="menuitem"
        onClick={handleEdit}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-left"
      >
        <Image src="/icons/edit.svg" alt="" width={15} height={15} />
        <span>{USERS_CONSTANTS.actionsMenu.editUser}</span>
      </button>

      {/* Divider */}
      <div className="my-1 border-t border-slate-100" />

      {/* Delete User */}
      <button
        type="button"
        role="menuitem"
        onClick={handleDelete}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
      >
        <Image src="/icons/trash.svg" alt="" width={15} height={15} />
        <span>{USERS_CONSTANTS.actionsMenu.deleteUser}</span>
      </button>
    </div>
  );

  return (
    <>
      {/* 3-dots Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label={USERS_CONSTANTS.actionsMenu.ariaLabel(user.firstName, user.lastName)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/70 transition-all duration-150 cursor-pointer shadow-2xs"
      >
        <Image src="/icons/more-vertical.svg" alt="Actions" width={16} height={16} />
      </button>

      {/* Render menu into Portal outside the table DOM container */}
      {mounted && typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </>
  );
});

UserActionsMenu.displayName = 'UserActionsMenu';
