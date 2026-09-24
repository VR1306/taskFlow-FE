'use client';

import React, { memo, useMemo } from 'react';
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
  const isProtectedSystemRole =
    role.isSystem || role.roleType === 'Taskflow Admin' || roleDisplayName === 'Taskflow Admin';

  const menuItems = useMemo<(ActionMenuItem | false | undefined)[]>(() => {
    return [
      {
        key: 'view',
        label: 'View Details',
        icon: '/icons/eye.svg',
        onClick: () => onView(role),
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
  }, [role, isProtectedSystemRole, onView, onEdit, onDelete, canEdit, canDelete]);

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
