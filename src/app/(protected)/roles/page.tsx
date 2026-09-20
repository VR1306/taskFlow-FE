'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  Button,
  Badge,
  Pagination,
  Image,
  ConfirmationModal,
  Table,
  TableColumn,
  EmptyState,
  ExportButton,
  Tooltip,
} from '@/components/ui';
import {
  RoleActionsMenu,
  CreateRoleDrawer,
  ViewRoleDrawer,
  EditRoleDrawer,
  RoleFilterDrawer,
} from '@/components/roles';
import {
  getRoleTypeBadgeVariant,
  formatDate,
  useDebounce,
  usePermission,
  useMounted,
  exportToCsv,
  exportToJson,
  ExportColumn,
} from '@/helpers';
import { ROLES_CONSTANTS } from '@/constants';
import {
  useAppDispatch,
  useAppSelector,
  fetchRoles,
  setRolesCurrentPage,
  setRolesLimit,
  setRolesFilters,
  clearRolesFilters,
  setRolesFilterField,
  deleteRoleThunk,
} from '@/store';
import { RoleRecord, RoleFilters } from '@/types';

// Helper functions extracted outside the component
const getRoleIdString = (role: RoleRecord, fallback = 'N/A'): string => {
  if (role.roleId) return role.roleId;
  if (role.id) return String(role.id);
  if (role._id) return String(role._id);
  return fallback;
};

const getRolePermissionsTooltip = (perms: string[] = []): string => {
  if (perms.includes('*')) {
    return 'Full Administrator Access (All permissions granted)';
  }
  if (perms.length > 0) {
    return `Granted permissions (${perms.length}): ${perms.join(', ')}`;
  }
  return 'No permissions granted';
};

const getRolePermissionsCountText = (perms: string[] = []): string => {
  if (perms.includes('*')) {
    return 'All (*)';
  }
  return String(perms.length);
};

const getRolePermissionsListExport = (perms: string[] = []): string => {
  if (perms.includes('*')) {
    return '*';
  }
  return perms.join('; ');
};

const formatRoleForJson = (r: RoleRecord) => {
  return {
    roleId: getRoleIdString(r),
    roleName: r.name || r.roleName || '',
    description: r.description || r.roleDescription || '',
    roleType: r.roleType || 'Custom',
    permissions: r.permissions || r.rolePermissions || [],
    status: r.isActive !== false ? 'Active' : 'Inactive',
    isSystemRole: Boolean(r.isSystem),
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
  };
};

const roleExportColumns: ExportColumn<RoleRecord>[] = [
  {
    header: 'Role ID',
    accessor: (r: RoleRecord) => getRoleIdString(r),
  },
  { header: 'Role Name', accessor: (r: RoleRecord) => r.name || r.roleName || '' },
  {
    header: 'Description',
    accessor: (r: RoleRecord) => r.description || r.roleDescription || '',
  },
  { header: 'Role Type', accessor: (r: RoleRecord) => r.roleType || 'Custom' },
  {
    header: 'Permissions Count',
    accessor: (r: RoleRecord) => {
      const perms = r.permissions || r.rolePermissions || [];
      return getRolePermissionsCountText(perms);
    },
  },
  {
    header: 'Permissions List',
    accessor: (r: RoleRecord) => {
      const perms = r.permissions || r.rolePermissions || [];
      return getRolePermissionsListExport(perms);
    },
  },
  {
    header: 'Status',
    accessor: (r: RoleRecord) => (r.isActive !== false ? 'Active' : 'Inactive'),
  },
  {
    header: 'Is System Role',
    accessor: (r: RoleRecord) => (r.isSystem ? 'Yes' : 'No'),
  },
  {
    header: 'Created Date',
    accessor: (r: RoleRecord) => formatDate(r.createdAt),
  },
];

interface TableColumnsProps {
  onView: (role: RoleRecord) => void;
  onEdit?: (role: RoleRecord) => void;
  onDelete?: (role: RoleRecord) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const buildRoleTableColumns = ({
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: TableColumnsProps): TableColumn<RoleRecord>[] => [
  {
    key: 'roleId',
    header: 'Role ID',
    align: 'left',
    className: 'w-28 hidden md:table-cell',
    render: (role) => {
      const idText = getRoleIdString(role);
      return (
        <Tooltip content={`Role ID: ${idText}`}>
          <button
            type="button"
            onClick={() => onView(role)}
            className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors truncate max-w-full"
          >
            <span className="truncate">{idText}</span>
          </button>
        </Tooltip>
      );
    },
  },
  {
    key: 'name',
    header: 'Role Name & Details',
    align: 'left',
    render: (role) => {
      const roleDisplayName = role.name || role.roleName || '';
      const roleDesc = role.description || role.roleDescription || '';
      const idText = getRoleIdString(role, '');
      return (
        <div className="max-w-xs sm:max-w-sm py-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Tooltip content={roleDisplayName} maxWidth="max-w-sm">
              <button
                type="button"
                onClick={() => onView(role)}
                className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors text-left focus:outline-hidden truncate max-w-full block"
              >
                {roleDisplayName}
              </button>
            </Tooltip>
            {Boolean(idText) && (
              <Tooltip content={`Role ID: ${idText}`}>
                <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/60 inline-flex md:hidden truncate max-w-[120px]">
                  {idText}
                </span>
              </Tooltip>
            )}
            {role.isSystem && (
              <Badge size="sm" variant="purple">
                System
              </Badge>
            )}
          </div>
          {Boolean(roleDesc) && (
            <Tooltip
              content={roleDesc}
              maxWidth="max-w-md"
              triggerClassName="block w-full min-w-0 max-w-full"
            >
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 leading-relaxed truncate cursor-default">
                {roleDesc}
              </p>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    key: 'roleType',
    header: 'Role Type',
    align: 'center',
    className: 'hidden lg:table-cell',
    render: (role) => {
      const roleType = role.roleType || 'Custom';
      return (
        <Tooltip content={`Role Type: ${roleType}`}>
          <span>
            <Badge variant={getRoleTypeBadgeVariant(roleType)}>{roleType}</Badge>
          </span>
        </Tooltip>
      );
    },
  },
  {
    key: 'permissionsCount',
    header: 'Permissions',
    align: 'center',
    render: (role) => {
      const permList = role.permissions || role.rolePermissions || [];
      const isAll = permList.includes('*');
      const tooltipContent = getRolePermissionsTooltip(permList);
      const badgeText = isAll ? 'Full Access (*)' : `${permList.length} granted`;
      return (
        <Tooltip content={tooltipContent} maxWidth="max-w-md">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            {badgeText}
          </span>
        </Tooltip>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (role) => {
      const isRoleActive = role.isActive !== false;
      return (
        <Badge variant={isRoleActive ? 'success' : 'danger'}>
          {isRoleActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    key: 'createdAt',
    header: 'Created On',
    align: 'right',
    className: 'hidden lg:table-cell',
    render: (role) => (
      <span className="text-xs text-slate-500 font-medium" suppressHydrationWarning>
        {formatDate(role.createdAt)}
      </span>
    ),
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    className: 'w-12',
    render: (role) => (
      <div className="flex justify-end">
        <RoleActionsMenu
          role={role}
          onView={onView}
          onEdit={canEdit ? onEdit : undefined}
          onDelete={canDelete ? onDelete : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    ),
  },
];

interface ActiveFilterChipsProps {
  filters: RoleFilters;
  onRemoveField: (field: keyof RoleFilters) => void;
  onReset: () => void;
}

const ActiveFilterChips = React.memo(function ActiveFilterChips({
  filters,
  onRemoveField,
  onReset,
}: ActiveFilterChipsProps) {
  const activeCount = (filters?.roleType ? 1 : 0) + (filters?.status ? 1 : 0);
  if (activeCount === 0) return null;

  return (
    <div className="bg-slate-50/80 px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-500">Active Filters:</span>

        {filters.roleType && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 text-xs font-semibold animate-in zoom-in-95">
            <span>Type: {filters.roleType}</span>
            <button
              type="button"
              onClick={() => onRemoveField('roleType')}
              aria-label="Remove role type filter"
              className="hover:text-blue-900 rounded-sm cursor-pointer"
            >
              <Image src="/icons/close.svg" alt="" width={12} height={12} />
            </button>
          </span>
        )}

        {filters.status && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 text-xs font-semibold animate-in zoom-in-95">
            <span>Status: {filters.status === 'active' ? 'Active' : 'Inactive'}</span>
            <button
              type="button"
              onClick={() => onRemoveField('status')}
              aria-label="Remove status filter"
              className="hover:text-emerald-900 rounded-sm cursor-pointer"
            >
              <Image src="/icons/close.svg" alt="" width={12} height={12} />
            </button>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
      >
        Reset All
      </button>
    </div>
  );
});

interface RolesTableToolbarProps {
  searchTerm: string;
  isSearching: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  isExporting: boolean;
  rolesCount: number;
  onOpenFilter: () => void;
  activeFilterCount: number;
}

const RolesTableToolbar = React.memo(function RolesTableToolbar({
  searchTerm,
  isSearching,
  onSearchChange,
  onClearSearch,
  onExportCsv,
  onExportJson,
  isExporting,
  rolesCount,
  onOpenFilter,
  activeFilterCount,
}: RolesTableToolbarProps) {
  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      <div className="relative flex-1 min-w-0 md:w-64 lg:w-80">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          {isSearching ? (
            <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          ) : (
            <Image src="/icons/search.svg" alt="" width={14} height={14} className="opacity-50" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={ROLES_CONSTANTS.searchPlaceholder}
          className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-8.5 sm:pl-9 pr-7 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/15 hover:border-slate-300 h-10"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={onClearSearch}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <Image src="/icons/close.svg" alt="Clear" width={13} height={13} />
          </button>
        )}
      </div>

      <ExportButton
        onExportCsv={onExportCsv}
        onExportJson={onExportJson}
        disabled={rolesCount === 0}
        isLoading={isExporting}
        className="shrink-0"
      />

      <Button
        type="button"
        variant="outline"
        onClick={onOpenFilter}
        className={`shrink-0 text-xs sm:text-sm font-semibold h-10 px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 border-slate-200/90 ${
          activeFilterCount > 0
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/80 shadow-2xs'
            : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Image
          src="/icons/filter.svg"
          alt=""
          width={14}
          height={14}
          className={activeFilterCount > 0 ? 'text-blue-600' : 'opacity-70'}
        />
        <span className="hidden min-[380px]:inline">Filter</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-2xs">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
});

export default function RolesPage() {
  const dispatch = useAppDispatch();
  const {
    cachedPages,
    currentPage,
    limit,
    filters,
    totalItems,
    totalPages,
    isLoading,
    isActionLoading,
  } = useAppSelector((state) => state.roles);

  const mounted = useMounted();

  // Permission Gates
  const rawCanViewRoles = usePermission(['roles.view', '*']);
  const rawCanCreateRole = usePermission(['roles.create', '*']);
  const rawCanEditRole = usePermission(['roles.edit', '*']);
  const rawCanDeleteRole = usePermission(['roles.delete', '*']);

  const canViewRoles = !mounted || rawCanViewRoles;
  const canCreateRole = !mounted || rawCanCreateRole;
  const canEditRole = !mounted || rawCanEditRole;
  const canDeleteRole = !mounted || rawCanDeleteRole;

  // Search & Export state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const isSearching = searchTerm.trim() !== debouncedSearch.trim();
  const [isExporting, setIsExporting] = useState(false);

  // Drawer & Modal states
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState<RoleRecord | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<RoleRecord | null>(null);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState<RoleRecord | null>(null);

  const activeFilterCount = (filters?.roleType ? 1 : 0) + (filters?.status ? 1 : 0);

  // Fetch roles
  useEffect(() => {
    if (mounted && !canViewRoles) return;

    dispatch(
      fetchRoles({
        page: currentPage,
        limit,
        search: debouncedSearch,
        roleType: filters.roleType,
        status: filters.status,
      })
    );
  }, [dispatch, currentPage, limit, debouncedSearch, filters, canViewRoles, mounted]);

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setRolesCurrentPage(page));
      dispatch(
        fetchRoles({
          page,
          limit,
          search: debouncedSearch,
          roleType: filters.roleType,
          status: filters.status,
        })
      );
    },
    [dispatch, limit, debouncedSearch, filters]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      dispatch(setRolesLimit(newLimit));
      dispatch(
        fetchRoles({
          page: 1,
          limit: newLimit,
          search: debouncedSearch,
          roleType: filters.roleType,
          status: filters.status,
        })
      );
    },
    [dispatch, debouncedSearch, filters]
  );

  const handleApplyFilters = useCallback(
    (newFilters: RoleFilters) => {
      dispatch(setRolesFilters(newFilters));
      dispatch(
        fetchRoles({
          page: 1,
          limit,
          search: debouncedSearch,
          roleType: newFilters.roleType,
          status: newFilters.status,
          forceRefresh: true,
        })
      );
    },
    [dispatch, limit, debouncedSearch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(clearRolesFilters());
    dispatch(
      fetchRoles({
        page: 1,
        limit,
        search: debouncedSearch,
        roleType: undefined,
        status: undefined,
        forceRefresh: true,
      })
    );
  }, [dispatch, limit, debouncedSearch]);

  const handleRemoveFilterField = useCallback(
    (field: keyof RoleFilters) => {
      dispatch(setRolesFilterField({ field, value: undefined }));
      const updatedFilters = { ...filters, [field]: undefined };
      dispatch(
        fetchRoles({
          page: 1,
          limit,
          search: debouncedSearch,
          roleType: updatedFilters.roleType,
          status: updatedFilters.status,
          forceRefresh: true,
        })
      );
    },
    [dispatch, limit, debouncedSearch, filters]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRoleForDelete) return;
    const roleId = selectedRoleForDelete.id || selectedRoleForDelete._id;
    if (!roleId) return;

    await dispatch(deleteRoleThunk(roleId));
    setSelectedRoleForDelete(null);
  }, [dispatch, selectedRoleForDelete]);

  // Compute current page items from cache
  const cacheKey = `${currentPage}-${limit}-${debouncedSearch.trim()}-${filters.roleType || ''}-${filters.status || ''}`;
  const rolesList = useMemo(() => {
    return cachedPages[cacheKey]?.data || [];
  }, [cachedPages, cacheKey]);

  const isTableLoading = (isLoading && rolesList.length === 0) || isSearching;

  // Fetch all matching records for bulk export
  const fetchAllMatchingRoles = useCallback(async (): Promise<RoleRecord[]> => {
    const { rolesService } = await import('@/services/roles');
    const response = await rolesService.getRoles({
      page: 1,
      limit: 1000,
      search: debouncedSearch.trim() || undefined,
      roleType: filters.roleType || undefined,
      status: filters.status || undefined,
    });
    return response.data || [];
  }, [debouncedSearch, filters]);

  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      const allRoles = await fetchAllMatchingRoles();
      exportToCsv(allRoles, 'taskflow-roles-export', roleExportColumns);
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllMatchingRoles]);

  const handleExportJson = useCallback(async () => {
    try {
      setIsExporting(true);
      const allRoles = await fetchAllMatchingRoles();
      exportToJson(allRoles, 'taskflow-roles-export', formatRoleForJson);
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllMatchingRoles]);

  // Define Table Columns
  const columns = useMemo(
    () =>
      buildRoleTableColumns({
        onView: (role) => setSelectedRoleForView(role),
        onEdit: canEditRole ? (role) => setSelectedRoleForEdit(role) : undefined,
        onDelete: canDeleteRole ? (role) => setSelectedRoleForDelete(role) : undefined,
        canEdit: canEditRole,
        canDelete: canDeleteRole,
      }),
    [canEditRole, canDeleteRole]
  );

  let emptyAction: React.ReactNode = undefined;
  if (debouncedSearch || activeFilterCount > 0) {
    emptyAction = (
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          handleClearSearch();
          handleResetFilters();
        }}
      >
        Clear Search & Filters
      </Button>
    );
  } else if (canCreateRole) {
    emptyAction = (
      <Button type="button" variant="primary" onClick={() => setIsCreateDrawerOpen(true)}>
        {ROLES_CONSTANTS.createButtonText}
      </Button>
    );
  }

  // If user lacks permission to view roles, render unauthorized empty state after mount
  if (mounted && !rawCanViewRoles) {
    return (
      <div className="py-12 px-4 flex items-center justify-center">
        <EmptyState
          variant="unauthorized"
          title={ROLES_CONSTANTS.unauthorizedTitle}
          description={ROLES_CONSTANTS.unauthorizedDescription}
          className="max-w-lg bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {ROLES_CONSTANTS.pageTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
            {ROLES_CONSTANTS.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {canCreateRole && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsCreateDrawerOpen(true)}
              className="w-full sm:w-auto text-xs sm:text-sm font-semibold"
            >
              <Image src="/icons/plus-white.svg" alt="" width={15} height={15} />
              <span>{ROLES_CONSTANTS.createButtonText}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200">
        {/* Card Top Header: Title & Search/Filter Controls */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center justify-between md:justify-start gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
              {ROLES_CONSTANTS.rolesCardTitle(totalItems > 0 ? totalItems : rolesList.length)}
            </h2>
            {isTableLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                {isSearching ? 'Searching...' : 'Updating...'}
              </span>
            )}
          </div>

          <RolesTableToolbar
            searchTerm={searchTerm}
            isSearching={isSearching}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
            isExporting={isExporting}
            rolesCount={rolesList.length}
            onOpenFilter={() => setIsFilterDrawerOpen(true)}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Active Filter Chips Bar */}
        <ActiveFilterChips
          filters={filters}
          onRemoveField={handleRemoveFilterField}
          onReset={handleResetFilters}
        />

        {/* Roles Table */}
        <Table
          columns={columns}
          data={rolesList}
          isLoading={isTableLoading}
          loadingText={isSearching ? 'Searching roles...' : 'Updating roles...'}
          emptyTitle={ROLES_CONSTANTS.emptyStateTitle}
          emptyMessage={ROLES_CONSTANTS.emptyStateDescription}
          emptyVariant={debouncedSearch || activeFilterCount > 0 ? 'no-search' : 'no-data'}
          emptyAction={emptyAction}
          ariaLabel="Roles Table"
        />

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              disabled={isTableLoading}
            />
          </div>
        )}
      </div>

      {/* Create Role Drawer */}
      <CreateRoleDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSuccess={() => {
          dispatch(
            fetchRoles({
              page: 1,
              limit,
              search: debouncedSearch,
              roleType: filters.roleType,
              status: filters.status,
              forceRefresh: true,
            })
          );
        }}
      />

      {/* Edit Role Drawer */}
      <EditRoleDrawer
        isOpen={Boolean(selectedRoleForEdit)}
        onClose={() => setSelectedRoleForEdit(null)}
        role={selectedRoleForEdit}
        onSuccess={() => {
          dispatch(
            fetchRoles({
              page: currentPage,
              limit,
              search: debouncedSearch,
              roleType: filters.roleType,
              status: filters.status,
              forceRefresh: true,
            })
          );
        }}
      />

      {/* View Role Drawer */}
      <ViewRoleDrawer
        isOpen={Boolean(selectedRoleForView)}
        onClose={() => setSelectedRoleForView(null)}
        role={selectedRoleForView}
        onEdit={canEditRole ? (role) => setSelectedRoleForEdit(role) : undefined}
        canEdit={canEditRole}
      />

      {/* Role Filter Drawer */}
      <RoleFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        currentFilters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Delete Role Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(selectedRoleForDelete)}
        onClose={() => setSelectedRoleForDelete(null)}
        onConfirm={handleConfirmDelete}
        title={ROLES_CONSTANTS.deleteModal.title}
        message={
          selectedRoleForDelete
            ? `Are you sure you want to permanently delete '${selectedRoleForDelete.name || selectedRoleForDelete.roleName}'? This action cannot be undone.`
            : ROLES_CONSTANTS.deleteModal.message
        }
        confirmText={ROLES_CONSTANTS.deleteModal.confirmText}
        cancelText={ROLES_CONSTANTS.deleteModal.cancelText}
        isLoading={isActionLoading}
        isDestructive={true}
      />
    </div>
  );
}
