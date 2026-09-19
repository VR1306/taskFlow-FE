'use client';

import React, { memo } from 'react';
import { Select, Button, Image } from '@/components/ui';
import { DynamicPermissionsSelector } from './DynamicPermissionsSelector';
import { ROLES_CONSTANTS } from '@/constants';
import { RoleType, PermissionModule } from '@/types';

export function validateRoleName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Role name is required.';
  if (trimmed.length < 2) return 'Role name must be at least 2 characters long.';
  if (trimmed.length > 60) return 'Role name cannot exceed 60 characters.';
  return undefined;
}

export interface RoleDrawerFooterProps {
  onClose: () => void;
  onSubmit: (e?: React.SyntheticEvent) => void;
  isLoading: boolean;
  cancelText: string;
  submitText: string;
  submittingText: string;
  submitIcon: string;
}

export const RoleDrawerFooter = memo(function RoleDrawerFooter({
  onClose,
  onSubmit,
  isLoading,
  cancelText,
  submitText,
  submittingText,
  submitIcon,
}: RoleDrawerFooterProps) {
  return (
    <div className="flex w-full items-center justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="text-xs sm:text-sm font-semibold py-2.5 px-4"
      >
        {cancelText}
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={onSubmit}
        isLoading={isLoading}
        leftIcon={<Image src={submitIcon} alt="" width={15} height={15} />}
        className="text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 py-2.5 px-5"
      >
        {isLoading ? submittingText : submitText}
      </Button>
    </div>
  );
});

RoleDrawerFooter.displayName = 'RoleDrawerFooter';

export interface RoleFormFieldsProps {
  name: string;
  onNameChange: (val: string) => void;
  nameError?: string;
  description: string;
  onDescriptionChange: (val: string) => void;
  roleType: RoleType;
  onRoleTypeChange: (val: RoleType) => void;
  isRoleTypeDisabled?: boolean;
  isNameDisabled?: boolean;
  isActive: boolean;
  onIsActiveChange: (val: boolean) => void;
  isStatusDisabled?: boolean;
  statusHelpText?: string;
  selectedPermissions: string[];
  onPermissionsChange: (perms: string[]) => void;
  permissionsCatalogue: PermissionModule[];
  isDisabled?: boolean;
  isPermissionsLoading?: boolean;
  roleIdBadge?: string;
  nameInputId?: string;
  typeSelectId?: string;
  descriptionInputId?: string;
}

const roleTypeSelectOptions = ROLES_CONSTANTS.roleTypeOptions.map((opt) => ({
  value: opt.value,
  label: opt.label,
}));

export const RoleFormFields = memo(function RoleFormFields({
  name,
  onNameChange,
  nameError,
  description,
  onDescriptionChange,
  roleType,
  onRoleTypeChange,
  isRoleTypeDisabled,
  isNameDisabled,
  isActive,
  onIsActiveChange,
  isStatusDisabled,
  statusHelpText,
  selectedPermissions,
  onPermissionsChange,
  permissionsCatalogue,
  isDisabled,
  isPermissionsLoading,
  roleIdBadge,
  nameInputId = 'role-name-input',
  typeSelectId = 'role-type-select',
  descriptionInputId = 'role-description-input',
}: RoleFormFieldsProps) {
  return (
    <>
      {/* Section 1: Basic Role Details */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>{roleIdBadge ? 'Role Details' : 'Basic Role Details'}</span>
          </h3>
          {roleIdBadge && (
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              {roleIdBadge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role Name */}
          <div>
            <label htmlFor={nameInputId} className="block text-xs font-bold text-slate-700 mb-1.5">
              {ROLES_CONSTANTS.createDrawer.nameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              id={nameInputId}
              type="text"
              placeholder={ROLES_CONSTANTS.createDrawer.namePlaceholder}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isDisabled || isNameDisabled}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                nameError
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300'
              } ${isNameDisabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
            />
            {nameError && <p className="mt-1 text-xs text-rose-600 font-medium">{nameError}</p>}
          </div>

          {/* Role Type Selection */}
          <div>
            <label htmlFor={typeSelectId} className="block text-xs font-bold text-slate-700 mb-1.5">
              {ROLES_CONSTANTS.createDrawer.typeLabel}
            </label>
            <Select
              id={typeSelectId}
              options={roleTypeSelectOptions}
              value={roleType}
              onChange={(val) => onRoleTypeChange(val as RoleType)}
              placeholder={ROLES_CONSTANTS.createDrawer.typePlaceholder}
              isDisabled={isDisabled || isRoleTypeDisabled}
            />
          </div>
        </div>

        {/* Role Description */}
        <div>
          <label
            htmlFor={descriptionInputId}
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            {ROLES_CONSTANTS.createDrawer.descLabel}
          </label>
          <textarea
            id={descriptionInputId}
            rows={2}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={ROLES_CONSTANTS.createDrawer.descPlaceholder}
            disabled={isDisabled}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 hover:border-slate-300 transition-all resize-none"
          />
        </div>

        {/* Active Status Switch Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              {ROLES_CONSTANTS.createDrawer.statusLabel}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {statusHelpText || ROLES_CONSTANTS.createDrawer.statusDescription}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => {
              if (!isStatusDisabled) onIsActiveChange(!isActive);
            }}
            disabled={isDisabled || isStatusDisabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isActive ? 'bg-blue-600' : 'bg-slate-300'
            } ${isStatusDisabled ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Section 2: Permissions Configuration */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {ROLES_CONSTANTS.createDrawer.permissionsLabel}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {ROLES_CONSTANTS.createDrawer.permissionsDescription}
          </p>
        </div>

        <DynamicPermissionsSelector
          permissionsCatalogue={permissionsCatalogue}
          selectedPermissions={selectedPermissions}
          onChange={onPermissionsChange}
          disabled={isDisabled || isPermissionsLoading}
        />
      </div>
    </>
  );
});

RoleFormFields.displayName = 'RoleFormFields';
