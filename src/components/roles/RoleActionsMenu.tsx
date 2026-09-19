'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { ActionsMenu, ActionMenuItem } from '@/components/ui';
import { RoleRecord } from '@/types';

export interface RoleActionsMenuProps {
  role: RoleRecord;
  onView: (role: RoleRecord) => void;
  onEdit?: (role: RoleRecord) => void;
  onDelete?: (role: RoleRecord) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const RoleActionsMenu = memo(function RoleActionsMenu({
  role,
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: Readonly<RoleActionsMenuProps>) {
  const roleDisplayName = role.name || role.roleName || 'Role';
  const roleIdentifier = role.roleId || role.id || role._id || '';
  const isProtectedSystemRole =
    role.isSystem || role.roleType === 'Super Admin' || roleDisplayName === 'Super Admin';

  const handleCopyRoleId = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (typeof navigator !== 'undefined' && navigator.clipboard && roleIdentifier) {
        navigator.clipboard.writeText(roleIdentifier);
      }
    },
    [roleIdentifier]
  );

  const menuItems = useMemo<(ActionMenuItem | false | undefined)[]>(() => {
    return [
      {
        key: 'view',
        label: 'View Details',
        icon: '/icons/eye.svg',
        onClick: () => onView(role),
      },
      Boolean(roleIdentifier) && {
        key: 'copy-id',
        label: 'Copy Role ID',
        icon: '/icons/bolt.svg',
        onClick: handleCopyRoleId,
      },
      Boolean(canEdit && onEdit && !isProtectedSystemRole) && {
        key: 'edit',
        label: 'Edit Role',
        icon: '/icons/edit.svg',
        onClick: () => onEdit?.(role),
      },
      Boolean(canDelete && onDelete && !isProtectedSystemRole) && {
        key: 'delete',
        label: 'Delete Role',
        icon: '/icons/trash.svg',
        onClick: () => onDelete?.(role),
        variant: 'danger' as const,
        hasDividerBefore: true,
      },
    ];
  }, [
    role,
    roleIdentifier,
    isProtectedSystemRole,
    onView,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
    handleCopyRoleId,
  ]);

  return (
    <div className="relative inline-block text-left">
      <ActionsMenu
        ariaLabel={`Actions for ${roleDisplayName}`}
        items={menuItems}
        menuTestId="role-actions-menu"
        triggerClassName="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
      />
    </div>
  );
});

RoleActionsMenu.displayName = 'RoleActionsMenu';
export default RoleActionsMenu;
