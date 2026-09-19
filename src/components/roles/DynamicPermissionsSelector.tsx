'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import { PermissionModule } from '@/types';
import { Badge, Image } from '@/components/ui';
import { getActionBadgeVariant } from '@/helpers';

export interface DynamicPermissionsSelectorProps {
  permissionsCatalogue?: PermissionModule[];
  selectedPermissions?: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
  isReadOnly?: boolean;
}

const getActionFilterLabel = (act: string): string => {
  if (act === 'read') return 'View';
  if (act === 'update') return 'Edit';
  return act;
};

export const DynamicPermissionsSelector = memo(function DynamicPermissionsSelector({
  permissionsCatalogue = [],
  selectedPermissions = [],
  onChange,
  disabled = false,
  isReadOnly = false,
}: Readonly<DynamicPermissionsSelectorProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionFilter, setActiveActionFilter] = useState<string>('all');

  // Flattened system permission IDs
  const allPermissionIds = useMemo(
    () => (permissionsCatalogue || []).flatMap((mod) => (mod.permissions || []).map((p) => p.id)),
    [permissionsCatalogue]
  );

  const grantedCount = selectedPermissions.length;
  const totalCount = allPermissionIds.length;
  const grantedPercentage = totalCount > 0 ? Math.round((grantedCount / totalCount) * 100) : 0;
  const isAllSelected =
    totalCount > 0 && allPermissionIds.every((id) => selectedPermissions.includes(id));

  // Toggle individual permission
  const handleTogglePermission = useCallback(
    (permId: string) => {
      if (disabled || isReadOnly) return;
      if (selectedPermissions.includes(permId)) {
        onChange(selectedPermissions.filter((id) => id !== permId));
      } else {
        onChange([...selectedPermissions, permId]);
      }
    },
    [disabled, isReadOnly, selectedPermissions, onChange]
  );

  // Toggle all permissions in a specific module
  const handleToggleModule = useCallback(
    (modulePermIds: string[]) => {
      if (disabled || isReadOnly) return;
      const allModuleSelected = modulePermIds.every((id) => selectedPermissions.includes(id));

      if (allModuleSelected) {
        onChange(selectedPermissions.filter((id) => !modulePermIds.includes(id)));
      } else {
        const toAdd = modulePermIds.filter((id) => !selectedPermissions.includes(id));
        onChange([...selectedPermissions, ...toAdd]);
      }
    },
    [disabled, isReadOnly, selectedPermissions, onChange]
  );

  // Master Toggle: Select all or Deselect all
  const handleToggleAll = useCallback(() => {
    if (disabled || isReadOnly) return;
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...allPermissionIds]);
    }
  }, [disabled, isReadOnly, isAllSelected, allPermissionIds, onChange]);

  // Filter modules based on search & action filter
  const filteredCatalogue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return permissionsCatalogue
      .map((module) => {
        const matchingPermissions = (module.permissions || []).filter((perm) => {
          // Action filter
          if (activeActionFilter !== 'all' && perm.action.toLowerCase() !== activeActionFilter) {
            return false;
          }
          // Text search filter
          if (!q) return true;
          return (
            perm.name.toLowerCase().includes(q) ||
            perm.id.toLowerCase().includes(q) ||
            perm.description.toLowerCase().includes(q) ||
            module.moduleName.toLowerCase().includes(q)
          );
        });

        return {
          ...module,
          permissions: matchingPermissions,
        };
      })
      .filter((module) => module.permissions.length > 0);
  }, [permissionsCatalogue, searchQuery, activeActionFilter]);

  if (!permissionsCatalogue || permissionsCatalogue.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 text-center text-xs sm:text-sm text-slate-500">
        No permissions catalogue available from server.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Master Control & Progress Summary Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/90 to-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 shadow-2xs">
              <Image src="/icons/shield-check.svg" alt="" width={20} height={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Permissions Matrix
                </span>
                <Badge size="sm" variant={grantedCount > 0 ? 'primary' : 'default'}>
                  {grantedCount} of {totalCount} Granted ({grantedPercentage}%)
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isReadOnly
                  ? 'Functional access rights and operations granted to this role.'
                  : 'Toggle specific granular capabilities for members assigned this role.'}
              </p>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleToggleAll}
                disabled={disabled}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                  isAllSelected
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                } disabled:opacity-50`}
              >
                {isAllSelected ? 'Deselect All' : 'Select All Permissions'}
              </button>
            </div>
          )}
        </div>

        {/* Mini Granted Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${grantedPercentage}%` }}
          />
        </div>

        {/* 2. Interactive Search & Action Filter Controls */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search within permissions */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Image src="/icons/search.svg" alt="" width={13} height={13} className="opacity-40" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter permissions by keyword (e.g., view, delete, create)..."
              className="w-full rounded-lg border border-slate-200/90 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 shadow-3xs transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600"
                aria-label="Clear filter search"
              >
                <Image src="/icons/close.svg" alt="" width={12} height={12} />
              </button>
            )}
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
            {['all', 'read', 'create', 'update', 'delete', 'export'].map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setActiveActionFilter(act)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                  activeActionFilter === act
                    ? 'bg-slate-900 text-white shadow-3xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {getActionFilterLabel(act)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Grouped Permissions Modules */}
      {filteredCatalogue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <p className="text-xs font-semibold text-slate-600">
            No permissions match your filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveActionFilter('all');
            }}
            className="text-xs font-bold text-blue-600 hover:underline mt-1.5 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCatalogue.map((module) => {
            const rawModule =
              permissionsCatalogue.find((m) => m.moduleKey === module.moduleKey) || module;
            const fullModulePermIds = (rawModule.permissions || []).map((p) => p.id);
            const selectedInModule = fullModulePermIds.filter((id) =>
              selectedPermissions.includes(id)
            );
            const isModuleFullySelected =
              fullModulePermIds.length > 0 && selectedInModule.length === fullModulePermIds.length;

            return (
              <section
                key={module.moduleKey}
                aria-label={module.moduleName}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all duration-200"
              >
                {/* Module Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 px-4 sm:px-5 py-3 border-b border-slate-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                        {module.moduleName}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-3xs">
                        {selectedInModule.length} of {fullModulePermIds.length} granted
                      </span>
                    </div>
                    {module.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {module.description}
                      </p>
                    )}
                  </div>

                  {!isReadOnly && (
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <label
                        htmlFor={`module-select-${module.moduleKey}`}
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
                          isModuleFullySelected
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          id={`module-select-${module.moduleKey}`}
                          type="checkbox"
                          checked={isModuleFullySelected}
                          disabled={disabled}
                          onChange={() => handleToggleModule(fullModulePermIds)}
                          className="h-3.5 w-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500/20 cursor-pointer"
                          aria-label={`Select all ${module.moduleName}`}
                        />
                        <span>{isModuleFullySelected ? 'Deselect Module' : 'Select All'}</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Permissions Grid */}
                <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {module.permissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);

                    return (
                      <label
                        key={perm.id}
                        htmlFor={`perm-${perm.id}`}
                        className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 select-none ${
                          isChecked
                            ? 'bg-blue-50/40 border-blue-300/90 shadow-2xs ring-1 ring-blue-500/10'
                            : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50'
                        } ${
                          disabled || isReadOnly
                            ? 'cursor-default'
                            : 'cursor-pointer active:scale-[0.99]'
                        }`}
                      >
                        {/* Custom Stylized Checkbox */}
                        <div className="pt-0.5 shrink-0">
                          <input
                            id={`perm-${perm.id}`}
                            type="checkbox"
                            checked={isChecked}
                            disabled={disabled || isReadOnly}
                            onChange={() => handleTogglePermission(perm.id)}
                            aria-label={perm.name}
                            className="h-4 w-4 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500/20 cursor-pointer disabled:cursor-default"
                          />
                        </div>

                        {/* Content & Action Tag */}
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {perm.name}
                            </span>
                            <Badge size="sm" variant={getActionBadgeVariant(perm.action)}>
                              {perm.action.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
});

DynamicPermissionsSelector.displayName = 'DynamicPermissionsSelector';
export default DynamicPermissionsSelector;
