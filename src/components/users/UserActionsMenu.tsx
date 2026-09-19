'use client';

import React, { memo, useMemo } from 'react';
import { ActionsMenu, ActionMenuItem } from '@/components/ui';
import { UserRecord } from '@/store';
import { USERS_CONSTANTS } from '@/constants';

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
  const menuItems = useMemo<ActionMenuItem[]>(
    () => [
      {
        key: 'view',
        label: USERS_CONSTANTS.actionsMenu.viewDetails,
        icon: '/icons/eye.svg',
        onClick: () => onView(user),
      },
      {
        key: 'edit',
        label: USERS_CONSTANTS.actionsMenu.editUser,
        icon: '/icons/edit.svg',
        onClick: () => onEdit(user),
      },
      {
        key: 'delete',
        label: USERS_CONSTANTS.actionsMenu.deleteUser,
        icon: '/icons/trash.svg',
        onClick: () => onDelete(user),
        variant: 'danger',
        hasDividerBefore: true,
      },
    ],
    [user, onView, onEdit, onDelete]
  );

  return (
    <ActionsMenu
      ariaLabel={USERS_CONSTANTS.actionsMenu.ariaLabel(user.firstName, user.lastName)}
      items={menuItems}
    />
  );
});

UserActionsMenu.displayName = 'UserActionsMenu';
export default UserActionsMenu;
