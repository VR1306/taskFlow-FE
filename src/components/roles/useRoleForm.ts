'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector, fetchPermissionsCatalogue } from '@/store';
import { RoleRecord, RoleType } from '@/types';
import { validateRoleName } from './RoleFormFields';

export interface UseRoleFormOptions {
  initialRole?: RoleRecord | null;
}

export function useRoleForm({ initialRole }: UseRoleFormOptions = {}) {
  const dispatch = useAppDispatch();
  const { permissionsCatalogue, isPermissionsLoading, isActionLoading } = useAppSelector(
    (state) => state.roles
  );

  const [name, setName] = useState(initialRole?.name || initialRole?.roleName || '');
  const [description, setDescription] = useState(
    initialRole?.description || initialRole?.roleDescription || ''
  );
  const [roleType, setRoleType] = useState<RoleType>(initialRole?.roleType || 'Custom');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialRole?.permissions || initialRole?.rolePermissions || []
  );
  const [isActive, setIsActive] = useState(initialRole?.isActive !== false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPermissionsCatalogue());
  }, [dispatch]);

  const handleNameChange = useCallback((val: string) => {
    setName(val);
    setNameError(undefined);
  }, []);

  const getFormData = useCallback(() => {
    setApiError(null);
    const error = validateRoleName(name);
    if (error) {
      setNameError(error);
      return null;
    }
    return {
      name: name.trim(),
      description: description.trim(),
      roleType,
      permissions: selectedPermissions,
      isActive,
    };
  }, [name, description, roleType, selectedPermissions, isActive]);

  return {
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
  };
}
