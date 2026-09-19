'use client';

import React, { memo, useCallback } from 'react';
import { Drawer } from '@/components/ui';
import { RoleFormFields, RoleDrawerFooter } from './RoleFormFields';
import { useRoleForm } from './useRoleForm';
import { createRoleThunk } from '@/store';
import { ROLES_CONSTANTS } from '@/constants';

export interface CreateRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateRoleDrawer = memo(function CreateRoleDrawer({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<CreateRoleDrawerProps>) {
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
  } = useRoleForm();

  const handleSubmit = useCallback(
    async (e?: React.SyntheticEvent) => {
      e?.preventDefault();
      const payload = getFormData();
      if (!payload) return;

      try {
        const resultAction = await dispatch(createRoleThunk(payload));

        if (createRoleThunk.fulfilled.match(resultAction)) {
          onClose();
          onSuccess?.();
        } else {
          setApiError(
            (resultAction.payload as string) || ROLES_CONSTANTS.createDrawer.defaultError
          );
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : ROLES_CONSTANTS.createDrawer.defaultError);
      }
    },
    [dispatch, getFormData, onClose, onSuccess, setApiError]
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={ROLES_CONSTANTS.createDrawer.title}
      description={ROLES_CONSTANTS.createDrawer.description}
      width="2xl"
      footer={
        <RoleDrawerFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          isLoading={isActionLoading}
          cancelText={ROLES_CONSTANTS.createDrawer.cancelButtonText}
          submitText={ROLES_CONSTANTS.createDrawer.submitButtonText}
          submittingText={ROLES_CONSTANTS.createDrawer.submittingButtonText}
          submitIcon="/icons/plus-white.svg"
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

        <RoleFormFields
          name={name}
          onNameChange={handleNameChange}
          nameError={nameError}
          description={description}
          onDescriptionChange={setDescription}
          roleType={roleType}
          onRoleTypeChange={setRoleType}
          isActive={isActive}
          onIsActiveChange={setIsActive}
          selectedPermissions={selectedPermissions}
          onPermissionsChange={setSelectedPermissions}
          permissionsCatalogue={permissionsCatalogue}
          isDisabled={isActionLoading}
          isPermissionsLoading={isPermissionsLoading}
          nameInputId="role-name-input"
          typeSelectId="role-type-select"
          descriptionInputId="role-description-input"
        />
      </form>
    </Drawer>
  );
});

CreateRoleDrawer.displayName = 'CreateRoleDrawer';
export default CreateRoleDrawer;
