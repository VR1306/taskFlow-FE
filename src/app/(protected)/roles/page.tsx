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
import { rolesService } from '@/services';
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

  // Hydration safety mount state
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

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const isSearching = searchTerm.trim() !== debouncedSearch.trim();
  const isTableLoading = isLoading || isSearching;

  // Drawer & Modal states
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState<RoleRecord | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<RoleRecord | null>(null);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState<RoleRecord | null>(null);

  // Active filter count
  const activeFilterCount = (filters?.roleType ? 1 : 0) + (filters?.status ? 1 : 0);

  // Fetch roles on mount or when page/limit/debouncedSearch/filters change
  useEffect(() => {
    if (canViewRoles) {
      dispatch(
        fetchRoles({
          page: currentPage,
          limit,
          search: debouncedSearch,
          roleType: filters.roleType,
          status: filters.status,
        })
      );
    }
  }, [
    dispatch,
    canViewRoles,
    currentPage,
    limit,
    debouncedSearch,
    filters.roleType,
    filters.status,
  ]);

  // Search change handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (currentPage !== 1) {
      dispatch(setRolesCurrentPage(1));
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (currentPage !== 1) {
      dispatch(setRolesCurrentPage(1));
    }
  };

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setRolesCurrentPage(newPage));
    },
    [dispatch]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      dispatch(setRolesLimit(newLimit));
    },
    [dispatch]
  );

  // Filter handlers
  const handleApplyFilters = useCallback(
    (newFilters: RoleFilters) => {
      dispatch(setRolesFilters(newFilters));
    },
    [dispatch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(clearRolesFilters());
  }, [dispatch]);

  const handleRemoveFilterField = (field: keyof RoleFilters) => {
    dispatch(setRolesFilterField({ field, value: undefined }));
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedRoleForDelete) return;
    try {
      const result = await dispatch(
        deleteRoleThunk(selectedRoleForDelete._id || selectedRoleForDelete.id || '')
      );
      if (deleteRoleThunk.fulfilled.match(result)) {
        setSelectedRoleForDelete(null);
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
      }
    } catch {
      // Handled by thunk state
    }
  };

  // Compute active page items from Redux cache or fallback
  const currentKey = `${currentPage}-${limit}-${debouncedSearch}-${filters.roleType || ''}-${filters.status || ''}`;
  const rolesList: RoleRecord[] = useMemo(() => {
    return cachedPages[currentKey]?.data || [];
  }, [cachedPages, currentKey]);

  // Export columns definition & handlers
  const roleExportColumns: ExportColumn<RoleRecord>[] = useMemo(
    () => [
      {
        header: 'Role ID',
        accessor: (r: RoleRecord) => r.roleId || r.id || (r._id ? String(r._id) : 'N/A'),
      },
      {
        header: 'Role Name',
        accessor: (r: RoleRecord) => r.name || r.roleName || 'N/A',
      },
      {
        header: 'Description',
        accessor: (r: RoleRecord) => r.description || r.roleDescription || '',
      },
      {
        header: 'Role Type',
        accessor: (r: RoleRecord) => r.roleType || 'Custom',
      },
      {
        header: 'Permissions Count',
        accessor: (r: RoleRecord) => (r.permissions || r.rolePermissions || []).length,
      },
      {
        header: 'Granted Permissions',
        accessor: (r: RoleRecord) => (r.permissions || r.rolePermissions || []).join('; '),
      },
      {
        header: 'Status',
        accessor: (r: RoleRecord) =>
          r.isActive !== false && r.status !== 'Inactive' ? 'Active' : 'Inactive',
      },
      {
        header: 'System Protected',
        accessor: (r: RoleRecord) => (r.isSystem ? 'Yes' : 'No'),
      },
      {
        header: 'Created Date',
        accessor: (r: RoleRecord) => (r.createdAt ? formatDate(r.createdAt) : 'N/A'),
      },
    ],
    []
  );

  const formatRoleForJson = useCallback(
    (r: RoleRecord) => ({
      roleId: r.roleId || r.id || (r._id ? String(r._id) : 'N/A'),
      roleName: r.name || r.roleName || 'N/A',
      description: r.description || r.roleDescription || '',
      roleType: r.roleType || 'Custom',
      permissionsCount: (r.permissions || r.rolePermissions || []).length,
      permissions: r.permissions || r.rolePermissions || [],
      grantedPermissions: (r.permissions || r.rolePermissions || []).join('; '),
      status: r.isActive !== false && r.status !== 'Inactive' ? 'Active' : 'Inactive',
      isSystem: Boolean(r.isSystem),
      systemProtected: r.isSystem ? 'Yes' : 'No',
      createdDate: r.createdAt ? formatDate(r.createdAt) : 'N/A',
    }),
    []
  );

  const [isExporting, setIsExporting] = useState(false);

  const fetchAllMatchingRoles = useCallback(async (): Promise<RoleRecord[]> => {
    try {
      const response = await rolesService.getRoles({
        page: 1,
        limit: 1000,
        search: debouncedSearch,
        roleType: filters.roleType,
        status: filters.status,
      });
      if (response?.data && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback to currently loaded roles in store
    }
    return rolesList;
  }, [debouncedSearch, filters.roleType, filters.status, rolesList]);

  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      const allRoles = await fetchAllMatchingRoles();
      exportToCsv(allRoles, 'taskflow-roles-export', roleExportColumns);
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllMatchingRoles, roleExportColumns]);

  const handleExportJson = useCallback(async () => {
    try {
      setIsExporting(true);
      const allRoles = await fetchAllMatchingRoles();
      exportToJson(allRoles, 'taskflow-roles-export', formatRoleForJson);
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllMatchingRoles, formatRoleForJson]);

  // Define Table Columns
  const columns: TableColumn<RoleRecord>[] = useMemo(
    () => [
      {
        key: 'roleId',
        header: 'Role ID',
        align: 'left',
        className: 'w-28',
        render: (role) => (
          <button
            type="button"
            onClick={() => setSelectedRoleForView(role)}
            className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <span>{role.roleId || role.id}</span>
          </button>
        ),
      },
      {
        key: 'name',
        header: 'Role Name & Details',
        align: 'left',
        render: (role) => {
          const roleDisplayName = role.name || role.roleName || '';
          const roleDesc = role.description || role.roleDescription || '';
          return (
            <div className="max-w-xs sm:max-w-sm py-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedRoleForView(role)}
                  className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors text-left focus:outline-hidden"
                >
                  {roleDisplayName}
                </button>
                {role.isSystem && (
                  <Badge size="sm" variant="purple">
                    System
                  </Badge>
                )}
              </div>
              {roleDesc && (
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                  {roleDesc}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: 'roleType',
        header: 'Role Type',
        align: 'center',
        render: (role) => (
          <Badge variant={getRoleTypeBadgeVariant(role.roleType)}>
            {role.roleType || 'Custom'}
          </Badge>
        ),
      },
      {
        key: 'permissionsCount',
        header: 'Permissions',
        align: 'center',
        render: (role) => {
          const permList = role.permissions || role.rolePermissions || [];
          const isAll = permList.includes('*');
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {isAll ? 'Full Access (*)' : `${permList.length} granted`}
            </span>
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
              onView={(r) => setSelectedRoleForView(r)}
              onEdit={canEditRole ? (r) => setSelectedRoleForEdit(r) : undefined}
              onDelete={canDeleteRole ? (r) => setSelectedRoleForDelete(r) : undefined}
              canEdit={canEditRole}
              canDelete={canDeleteRole}
            />
          </div>
        ),
      },
    ],
    [canEditRole, canDeleteRole]
  );

  const renderEmptyAction = () => {
    if (debouncedSearch || activeFilterCount > 0) {
      return (
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
    }
    if (canCreateRole) {
      return (
        <Button type="button" variant="primary" onClick={() => setIsCreateDrawerOpen(true)}>
          {ROLES_CONSTANTS.createButtonText}
        </Button>
      );
    }
    return undefined;
  };

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

        <div className="flex items-center gap-3">
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
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
              {ROLES_CONSTANTS.rolesCardTitle(totalItems > 0 ? totalItems : rolesList.length)}
            </h2>
            {isTableLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                {isSearching ? 'Searching...' : 'Updating...'}
              </span>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Live Search Input with Instant Spinner */}
            <div className="relative flex-1 md:w-72 lg:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                {isSearching ? (
                  <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                ) : (
                  <Image
                    src="/icons/search.svg"
                    alt=""
                    width={15}
                    height={15}
                    className="opacity-50"
                  />
                )}
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={ROLES_CONSTANTS.searchPlaceholder}
                className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/15 hover:border-slate-300"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  <Image src="/icons/close.svg" alt="Clear" width={14} height={14} />
                </button>
              )}
            </div>

            {/* Filter & Export Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <ExportButton
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                disabled={rolesList.length === 0}
                isLoading={isExporting}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFilterDrawerOpen(true)}
                className={`text-xs sm:text-sm font-semibold h-10 px-3.5 gap-2 border-slate-200/90 ${
                  activeFilterCount > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/80 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Image src="/icons/filter.svg" alt="" width={15} height={15} />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-2xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="bg-slate-50/80 px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">Active Filters:</span>

              {filters.roleType && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 text-xs font-semibold animate-in zoom-in-95">
                  <span>Type: {filters.roleType}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilterField('roleType')}
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
                    onClick={() => handleRemoveFilterField('status')}
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
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Roles Table */}
        <Table
          columns={columns}
          data={rolesList}
          isLoading={isTableLoading}
          loadingText={isSearching ? 'Searching roles...' : 'Updating roles...'}
          emptyTitle={ROLES_CONSTANTS.emptyStateTitle}
          emptyMessage={ROLES_CONSTANTS.emptyStateDescription}
          emptyVariant={debouncedSearch || activeFilterCount > 0 ? 'no-search' : 'no-data'}
          emptyAction={renderEmptyAction()}
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
