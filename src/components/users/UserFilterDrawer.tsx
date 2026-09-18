'use client';

import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { FilterDrawer, Select } from '@/components/ui';
import { USERS_CONSTANTS, FILTER_ROLE_OPTIONS, FILTER_STATUS_OPTIONS } from '@/constants';

export interface UserFiltersData {
  role?: string;
  status?: string;
}

export interface UserFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: UserFiltersData;
  filters?: UserFiltersData;
  onApply: (filters: UserFiltersData) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const UserFilterDrawer = memo(function UserFilterDrawer({
  isOpen,
  onClose,
  currentFilters,
  filters,
  onApply,
  onReset,
  isLoading = false,
}: UserFilterDrawerProps) {
  const effectiveFilters = currentFilters || filters || {};
  const [selectedRole, setSelectedRole] = useState<string>(effectiveFilters.role || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(effectiveFilters.status || 'all');

  // Sync draft state whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(effectiveFilters.role || 'all');
      setSelectedStatus(effectiveFilters.status || 'all');
    }
  }, [isOpen, effectiveFilters.role, effectiveFilters.status]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedRole && selectedRole !== 'all') count += 1;
    if (selectedStatus && selectedStatus !== 'all') count += 1;
    return count;
  }, [selectedRole, selectedStatus]);

  const handleRoleChange = useCallback((value: string) => {
    setSelectedRole(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value);
  }, []);

  const handleApply = useCallback(() => {
    onApply({
      role: selectedRole === 'all' ? undefined : selectedRole,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    });
    onClose();
  }, [selectedRole, selectedStatus, onApply, onClose]);

  const handleReset = useCallback(() => {
    setSelectedRole('all');
    setSelectedStatus('all');
    onReset();
    onClose();
  }, [onReset, onClose]);

  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      onReset={handleReset}
      title={USERS_CONSTANTS.filterDrawer.title}
      description={USERS_CONSTANTS.filterDrawer.description}
      activeFilterCount={activeFilterCount}
      applyButtonText={USERS_CONSTANTS.filterDrawer.applyButtonText}
      resetButtonText={USERS_CONSTANTS.filterDrawer.resetButtonText}
      isLoading={isLoading}
      width="md"
    >
      <div className="space-y-6">
        {/* Role Filter Selector */}
        <div className="space-y-2">
          <label
            htmlFor="filter-role-select"
            className="block text-xs sm:text-sm font-semibold text-slate-800"
          >
            {USERS_CONSTANTS.filterDrawer.roleLabel}
          </label>
          <Select<string>
            id="filter-role-select"
            options={FILTER_ROLE_OPTIONS}
            value={selectedRole}
            onChange={handleRoleChange}
            placeholder={USERS_CONSTANTS.filterDrawer.rolePlaceholder}
            isDisabled={isLoading}
          />
        </div>

        {/* Status Filter Selector */}
        <div className="space-y-2">
          <label
            htmlFor="filter-status-select"
            className="block text-xs sm:text-sm font-semibold text-slate-800"
          >
            {USERS_CONSTANTS.filterDrawer.statusLabel}
          </label>
          <Select<string>
            id="filter-status-select"
            options={FILTER_STATUS_OPTIONS}
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder={USERS_CONSTANTS.filterDrawer.statusPlaceholder}
            isDisabled={isLoading}
          />
        </div>
      </div>
    </FilterDrawer>
  );
});

UserFilterDrawer.displayName = 'UserFilterDrawer';

export default UserFilterDrawer;
