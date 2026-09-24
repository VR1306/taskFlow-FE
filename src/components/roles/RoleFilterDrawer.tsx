'use client';

import React, { memo, useState, useEffect } from 'react';
import { FilterDrawer, Select } from '@/components/ui';
import { ROLES_CONSTANTS } from '@/constants';
import { RoleFilters } from '@/types';

export interface RoleFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: RoleFilters;
  onApply: (filters: RoleFilters) => void;
  onReset?: () => void;
}

export const RoleFilterDrawer = memo(function RoleFilterDrawer({
  isOpen,
  onClose,
  currentFilters = {},
  onApply,
  onReset,
}: Readonly<RoleFilterDrawerProps>) {
  const [draftRoleType, setDraftRoleType] = useState(currentFilters?.roleType || '');
  const [draftStatus, setDraftStatus] = useState(currentFilters?.status || '');

  useEffect(() => {
    if (isOpen) {
      setDraftRoleType(currentFilters?.roleType || '');
      setDraftStatus(currentFilters?.status || '');
    }
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApply({
      roleType: draftRoleType || undefined,
      status: draftStatus || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setDraftRoleType('');
    setDraftStatus('');
    if (onReset) {
      onReset();
    }
    onClose();
  };

  const roleTypeOptionsWithAll = [
    { value: '', label: 'All Role Types' },
    ...ROLES_CONSTANTS.roleTypeOptions,
  ];

  const statusOptionsWithAll = [
    { value: '', label: 'All Status' },
    ...ROLES_CONSTANTS.statusOptions,
  ];

  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      onReset={handleReset}
      activeFilterCount={(draftRoleType ? 1 : 0) + (draftStatus ? 1 : 0)}
      title={ROLES_CONSTANTS.filterDrawer.title}
      description={ROLES_CONSTANTS.filterDrawer.description}
      applyButtonText={ROLES_CONSTANTS.filterDrawer.applyButtonText}
      resetButtonText={ROLES_CONSTANTS.filterDrawer.resetButtonText}
    >
      <div className="space-y-5">
        {/* Role Type Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {ROLES_CONSTANTS.filterDrawer.roleTypeLabel}
          </label>
          <Select
            options={roleTypeOptionsWithAll}
            value={draftRoleType}
            onChange={setDraftRoleType}
            placeholder={ROLES_CONSTANTS.filterDrawer.roleTypePlaceholder}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {ROLES_CONSTANTS.filterDrawer.statusLabel}
          </label>
          <Select
            options={statusOptionsWithAll}
            value={draftStatus}
            onChange={setDraftStatus}
            placeholder={ROLES_CONSTANTS.filterDrawer.statusPlaceholder}
          />
        </div>
      </div>
    </FilterDrawer>
  );
});

RoleFilterDrawer.displayName = 'RoleFilterDrawer';
export default RoleFilterDrawer;
