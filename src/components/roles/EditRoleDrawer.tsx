'use client';

import React, { memo, useCallback } from 'react';
import { Drawer, Badge } from '@/components/ui';
import { RoleFormFields, RoleDrawerFooter } from './RoleFormFields';
import { useRoleForm } from './useRoleForm';
import { updateRoleThunk } from '@/store';
import { ROLES_CONSTANTS } from '@/constants';
import { RoleRecord } from '@/types';

export interface EditRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleRecord | null;
  onSuccess?: () => void;
}

export const EditRoleDrawer = memo(function EditRoleDrawer({
  isOpen,
  onClose,
  role,
  onSuccess,
}: Readonly<EditRoleDrawerProps>) {
  const {
    dispatch,
    name,
    handleNameChange,
    nameError,
    description,
    setDescription,
    roleType,
    setRoleType,
    selectedPermissions,
    setSelectedPermissions,
    isActive,
    setIsActive,
    apiError,
    setApiError,
    permissionsCatalogue,
    isPermissionsLoading,
    isActionLoading,
    getFormData,
  } = useRoleForm({ initialRole: role });

  const handleSubmit = useCallback(
    async (e?: React.SyntheticEvent) => {
      e?.preventDefault();
      if (!role) return;

      const payload = getFormData();
      if (!payload) return;

      try {
        const resultAction = await dispatch(
          updateRoleThunk({
            id: role._id || role.id || '',
            data: payload,
          })
        );

        if (updateRoleThunk.fulfilled.match(resultAction)) {
          onClose();
          onSuccess?.();
        } else {
          setApiError((resultAction.payload as string) || ROLES_CONSTANTS.editDrawer.defaultError);
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : ROLES_CONSTANTS.editDrawer.defaultError);
      }
    },
    [dispatch, role, getFormData, onClose, onSuccess, setApiError]
  );

  const roleDisplayName = role?.name || role?.roleName || '';
  const isSuperAdmin = roleDisplayName === 'Super Admin';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={ROLES_CONSTANTS.editDrawer.title}
      description={ROLES_CONSTANTS.editDrawer.description}
      width="2xl"
      footer={
        <RoleDrawerFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          isLoading={isActionLoading}
          cancelText={ROLES_CONSTANTS.editDrawer.cancelButtonText}
          submitText={ROLES_CONSTANTS.editDrawer.submitButtonText}
          submittingText={ROLES_CONSTANTS.editDrawer.submittingButtonText}
          submitIcon="/icons/edit-white.svg"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 font-medium animate-in fade-in"
          >
            {apiError}
          </div>
        )}

        {role?.isSystem && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-900 shadow-2xs">
            <Badge size="sm" variant="purple">
              System Protected
            </Badge>
            <span className="font-medium leading-relaxed">
              This is a core system role. System protections are applied to maintain organizational
              security.
            </span>
          </div>
        )}

        <RoleFormFields
          name={name}
          onNameChange={handleNameChange}
          nameError={nameError}
          isNameDisabled={isSuperAdmin}
          description={description}
          onDescriptionChange={setDescription}
          roleType={roleType}
          onRoleTypeChange={setRoleType}
          isRoleTypeDisabled={Boolean(role?.isSystem)}
          isActive={isActive}
          onIsActiveChange={setIsActive}
          isStatusDisabled={isSuperAdmin}
          statusHelpText={
            isSuperAdmin
              ? 'Super Admin role must always remain active'
              : ROLES_CONSTANTS.createDrawer.statusDescription
          }
          selectedPermissions={selectedPermissions}
          onPermissionsChange={setSelectedPermissions}
          permissionsCatalogue={permissionsCatalogue}
          isDisabled={isActionLoading}
          isPermissionsLoading={isPermissionsLoading}
          roleIdBadge={role?.roleId || role?.id}
          nameInputId="edit-role-name-input"
          typeSelectId="edit-role-type-select"
          descriptionInputId="edit-role-description-input"
        />
      </form>
    </Drawer>
  );
});

EditRoleDrawer.displayName = 'EditRoleDrawer';
export default EditRoleDrawer;
