'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  Button,
  Loader,
  Avatar,
  Pagination,
  Image,
  ConfirmationModal,
  Table,
  TableColumn,
  ExportButton,
} from '@/components/ui';
import {
  UserActionsMenu,
  CreateUserDrawer,
  ViewUserDrawer,
  EditUserDrawer,
  UserFilterDrawer,
} from '@/components/users';
import {
  getRoleBadgeClass,
  useDebounce,
  exportToCsv,
  exportToJson,
  formatDate,
  ExportColumn,
} from '@/helpers';
import { USERS_CONSTANTS } from '@/constants';
import { apiClient } from '@/services';
import {
  useAppDispatch,
  useAppSelector,
  fetchUsers,
  setCurrentPage,
  setLimit,
  setFilters,
  clearFilters,
  setFilterField,
  deleteUserThunk,
  UserRecord,
  UserFilters,
  UsersApiResponse,
} from '@/store';

export default function UsersPage() {
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
    error,
  } = useAppSelector((state) => state.users);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const isSearching = searchTerm.trim() !== debouncedSearch.trim();
  const isTableLoading = isLoading || isSearching;

  // Drawer & Modal states
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<UserRecord | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserRecord | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserRecord | null>(null);

  // Active filter count
  const activeFilterCount = (filters?.role ? 1 : 0) + (filters?.status ? 1 : 0);

  // 1. Fetch users on mount or when page/limit/debouncedSearch/filters change
  useEffect(() => {
    dispatch(
      fetchUsers({
        page: currentPage,
        limit,
        search: debouncedSearch,
        role: filters.role,
        status: filters.status,
      })
    );
  }, [dispatch, currentPage, limit, debouncedSearch, filters.role, filters.status]);

  // 2. Search change handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
      }
    },
    [currentPage, dispatch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    if (currentPage !== 1) {
      dispatch(setCurrentPage(1));
    }
  }, [currentPage, dispatch]);

  // 3. Pagination change handlers
  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      dispatch(setLimit(newLimit));
    },
    [dispatch]
  );

  // 4. Filter Handlers
  const handleOpenFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen(true);
  }, []);

  const handleCloseFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen(false);
  }, []);

  const handleApplyFilters = useCallback(
    (newFilters: UserFilters) => {
      dispatch(setFilters(newFilters));
      dispatch(
        fetchUsers({
          page: 1,
          limit,
          search: debouncedSearch,
          role: newFilters.role,
          status: newFilters.status,
          forceRefresh: true,
        })
      );
      setIsFilterDrawerOpen(false);
    },
    [dispatch, limit, debouncedSearch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(clearFilters());
    dispatch(
      fetchUsers({
        page: 1,
        limit,
        search: debouncedSearch,
        role: undefined,
        status: undefined,
        forceRefresh: true,
      })
    );
    setIsFilterDrawerOpen(false);
  }, [dispatch, limit, debouncedSearch]);

  const handleRemoveRoleFilter = useCallback(() => {
    dispatch(setFilterField({ field: 'role', value: undefined }));
    dispatch(
      fetchUsers({
        page: 1,
        limit,
        search: debouncedSearch,
        role: undefined,
        status: filters.status,
        forceRefresh: true,
      })
    );
  }, [dispatch, limit, debouncedSearch, filters.status]);

  const handleRemoveStatusFilter = useCallback(() => {
    dispatch(setFilterField({ field: 'status', value: undefined }));
    dispatch(
      fetchUsers({
        page: 1,
        limit,
        search: debouncedSearch,
        role: filters.role,
        status: undefined,
        forceRefresh: true,
      })
    );
  }, [dispatch, limit, debouncedSearch, filters.role]);

  // 5. User action triggers (Drawers)
  const handleOpenCreateDrawer = useCallback(() => {
    setIsCreateDrawerOpen(true);
  }, []);

  const handleCloseCreateDrawer = useCallback(() => {
    setIsCreateDrawerOpen(false);
  }, []);

  const handleViewUser = useCallback((user: UserRecord) => {
    setSelectedUserForView(user);
  }, []);

  const handleCloseViewDrawer = useCallback(() => {
    setSelectedUserForView(null);
  }, []);

  const handleEditUser = useCallback((user: UserRecord) => {
    setSelectedUserForEdit(user);
  }, []);

  const handleCloseEditDrawer = useCallback(() => {
    setSelectedUserForEdit(null);
  }, []);

  const handleDeleteUser = useCallback((user: UserRecord) => {
    setSelectedUserForDelete(user);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setSelectedUserForDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUserForDelete) return;
    await dispatch(deleteUserThunk(selectedUserForDelete._id));
    setSelectedUserForDelete(null);
  }, [dispatch, selectedUserForDelete]);

  // 6. Memoized users list from active page cache
  const cacheKey = `${currentPage}-${limit}-${debouncedSearch.trim()}-${filters?.role || ''}-${filters?.status || ''}`;
  const users = useMemo(() => {
    return cachedPages[cacheKey]?.data || [];
  }, [cachedPages, cacheKey]);

  // Export columns and handlers
  const userExportColumns: ExportColumn<UserRecord>[] = useMemo(
    () => [
      {
        header: 'User ID',
        accessor: (u: UserRecord) => u.userId || (u._id ? String(u._id) : 'N/A'),
      },
      { header: 'First Name', accessor: (u: UserRecord) => u.firstName || '' },
      { header: 'Last Name', accessor: (u: UserRecord) => u.lastName || '' },
      {
        header: 'Full Name',
        accessor: (u: UserRecord) => `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      },
      { header: 'Email', accessor: (u: UserRecord) => u.email || '' },
      { header: 'Role', accessor: (u: UserRecord) => u.role || 'User' },
      {
        header: 'Status',
        accessor: (u: UserRecord) => (u.isActive !== false ? 'Active' : 'Inactive'),
      },
      {
        header: 'Joined Date',
        accessor: (u: UserRecord) => (u.createdAt ? formatDate(u.createdAt) : 'N/A'),
      },
    ],
    []
  );

  const formatUserForJson = useCallback(
    (u: UserRecord) => ({
      userId: u.userId || (u._id ? String(u._id) : 'N/A'),
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email || '',
      role: u.role || 'User',
      status: u.isActive !== false ? 'Active' : 'Inactive',
      joinedDate: u.createdAt ? formatDate(u.createdAt) : 'N/A',
    }),
    []
  );

  const [isExporting, setIsExporting] = useState(false);

  const fetchAllMatchingUsers = useCallback(async (): Promise<UserRecord[]> => {
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000',
      });
      if (debouncedSearch) queryParams.set('search', debouncedSearch);
      if (filters.role && filters.role !== 'all') queryParams.set('role', filters.role);
      if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status);

      const response = await apiClient.get<UsersApiResponse>(
        `/users/getAllUsers?${queryParams.toString()}`
      );
      if (response?.data && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback to currently loaded users in store
    }
    return users;
  }, [debouncedSearch, filters.role, filters.status, users]);

  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      const allUsers = await fetchAllMatchingUsers();
      exportToCsv(allUsers, 'taskflow-users-export', userExportColumns);
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllMatchingUsers, userExportColumns]);

  const handleExportJson = useCallback(async () => {
    try {
      setIsExporting(true);
      const allUsers = await fetchAllMatchingUsers();
      exportToJson(allUsers, 'taskflow-users-export', formatUserForJson);
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllMatchingUsers, formatUserForJson]);

  // 7. Generic Table Columns Definition
  const columns: TableColumn<UserRecord>[] = useMemo(
    () => [
      {
        key: 'user',
        header: USERS_CONSTANTS.tableHeaders.user,
        align: 'left',
        render: (user) => (
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 block truncate">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[11px] text-slate-500 block sm:hidden truncate lowercase">
                {user.email.toLowerCase()}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        header: USERS_CONSTANTS.tableHeaders.email,
        align: 'left',
        className: 'hidden sm:table-cell',
        render: (user) => (
          <span className="text-slate-600 font-medium text-xs sm:text-sm lowercase">
            {user.email.toLowerCase()}
          </span>
        ),
      },
      {
        key: 'role',
        header: USERS_CONSTANTS.tableHeaders.role,
        align: 'left',
        render: (user) => {
          const roleBadgeStyle = getRoleBadgeClass(user.role);
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeStyle}`}
            >
              {user.role}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: USERS_CONSTANTS.tableHeaders.status,
        align: 'left',
        render: (user) => {
          const isActive = user.isActive !== false;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        key: 'userId',
        header: USERS_CONSTANTS.tableHeaders.userId,
        align: 'left',
        className: 'hidden md:table-cell',
        render: (user) => (
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 rounded-md px-2 py-0.5 select-all">
            {user.userId || 'TF0001'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: USERS_CONSTANTS.tableHeaders.actions,
        align: 'right',
        render: (user) => (
          <UserActionsMenu
            user={user}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        ),
      },
    ],
    [handleViewUser, handleEditUser, handleDeleteUser]
  );

  const emptyMessage = debouncedSearch.trim()
    ? USERS_CONSTANTS.noSearchResults(debouncedSearch.trim())
    : USERS_CONSTANTS.emptyMessage;

  return (
    <div className="space-y-6">
      {/* Header section with modern Title and sleek '+ Create User' button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {USERS_CONSTANTS.pageTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
            {USERS_CONSTANTS.pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenCreateDrawer}
            leftIcon={<Image src="/icons/plus-white.svg" alt="" width={15} height={15} />}
            className="w-full sm:w-auto text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 py-2.5 px-4 rounded-xl cursor-pointer"
          >
            {USERS_CONSTANTS.createUserButtonText}
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs sm:text-sm text-rose-700 flex items-center justify-between"
        >
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              dispatch(
                fetchUsers({
                  page: currentPage,
                  limit,
                  search: debouncedSearch,
                  role: filters.role,
                  status: filters.status,
                  forceRefresh: true,
                })
              )
            }
            className="text-xs"
          >
            {USERS_CONSTANTS.retryButtonText}
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200">
        {/* Card Top Header: Title & Search/Filter Controls */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
              {USERS_CONSTANTS.membersCardTitle(totalItems > 0 ? totalItems : users.length)}
            </h2>
            {isTableLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                {isSearching ? 'Searching...' : USERS_CONSTANTS.updatingText}
              </span>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Search Input Bar */}
            <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {isSearching ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Loader size="xs" variant="monochrome" className="text-blue-500 scale-75" />
                  </div>
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
                placeholder={USERS_CONSTANTS.searchPlaceholder}
                aria-label={USERS_CONSTANTS.searchAriaLabel}
                className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all duration-200 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/15 hover:border-slate-300"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label={USERS_CONSTANTS.clearSearchAriaLabel}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  <Image
                    src="/icons/close.svg"
                    alt=""
                    width={13}
                    height={13}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  />
                </button>
              )}
            </div>

            {/* Filter & Export Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start shrink-0">
              <ExportButton
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                disabled={users.length === 0}
                isLoading={isExporting}
                className="flex-1 sm:flex-none justify-center"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleOpenFilterDrawer}
                aria-label={USERS_CONSTANTS.filterAriaLabel}
                className={`flex-1 sm:flex-none justify-center text-xs sm:text-sm font-semibold h-10 px-3.5 gap-2 border-slate-200/90 ${
                  activeFilterCount > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/80 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Image
                  src="/icons/filter.svg"
                  alt=""
                  width={15}
                  height={15}
                  className={activeFilterCount > 0 ? 'text-blue-600' : 'opacity-70'}
                />
                <span>{USERS_CONSTANTS.filterButtonText}</span>
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
          <div className="px-5 sm:px-6 py-2.5 bg-blue-50/40 border-b border-blue-100/60 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-medium text-slate-500">Active Filters:</span>
            {filters?.role && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs transition-all animate-in zoom-in-95 duration-150">
                <span className="text-slate-400">{USERS_CONSTANTS.activeFilters.rolePrefix}</span>
                <span className="font-semibold text-slate-800">{filters.role}</span>
                <button
                  type="button"
                  onClick={handleRemoveRoleFilter}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                  aria-label={`Remove role filter: ${filters.role}`}
                >
                  <Image
                    src="/icons/close.svg"
                    alt=""
                    width={10}
                    height={10}
                    className="opacity-60 hover:opacity-100"
                  />
                </button>
              </span>
            )}
            {filters?.status && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs transition-all animate-in zoom-in-95 duration-150">
                <span className="text-slate-400">{USERS_CONSTANTS.activeFilters.statusPrefix}</span>
                <span className="font-semibold text-slate-800">{filters.status}</span>
                <button
                  type="button"
                  onClick={handleRemoveStatusFilter}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                  aria-label={`Remove status filter: ${filters.status}`}
                >
                  <Image
                    src="/icons/close.svg"
                    alt=""
                    width={10}
                    height={10}
                    className="opacity-60 hover:opacity-100"
                  />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer ml-1 transition-colors"
            >
              {USERS_CONSTANTS.activeFilters.clearAll}
            </button>
          </div>
        )}

        {/* Reusable Generic Table Component */}
        <Table<UserRecord>
          columns={columns}
          data={users}
          keyExtractor={(user) => user._id}
          isLoading={isTableLoading}
          loadingText={isSearching ? 'Searching...' : USERS_CONSTANTS.loadingText}
          emptyVariant={debouncedSearch.trim() || activeFilterCount > 0 ? 'no-search' : 'no-data'}
          emptyTitle={
            debouncedSearch.trim() || activeFilterCount > 0
              ? 'No Matching Members'
              : 'No Members Found'
          }
          emptyMessage={emptyMessage}
          ariaLabel={USERS_CONSTANTS.pageTitle}
        />

        {/* React Pagination Component */}
        {totalItems > 0 && (
          <div className="border-t border-slate-100 px-4 sm:px-6 transition-opacity duration-200">
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

      {/* User Filter Slide-over Drawer */}
      <UserFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={handleCloseFilterDrawer}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Create User Slide-over Drawer */}
      <CreateUserDrawer isOpen={isCreateDrawerOpen} onClose={handleCloseCreateDrawer} />

      {/* View User Slide-over Drawer */}
      <ViewUserDrawer
        isOpen={Boolean(selectedUserForView)}
        onClose={handleCloseViewDrawer}
        onEdit={handleEditUser}
        user={selectedUserForView}
      />

      {/* Edit User Slide-over Drawer */}
      <EditUserDrawer
        isOpen={Boolean(selectedUserForEdit)}
        onClose={handleCloseEditDrawer}
        user={selectedUserForEdit}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(selectedUserForDelete)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={USERS_CONSTANTS.deleteModal.title}
        message={USERS_CONSTANTS.deleteModal.message(
          selectedUserForDelete?.firstName || '',
          selectedUserForDelete?.lastName || '',
          selectedUserForDelete?.userId || 'TF0001'
        )}
        confirmText={USERS_CONSTANTS.deleteModal.confirmButtonText}
        cancelText={USERS_CONSTANTS.deleteModal.cancelButtonText}
        isDestructive={true}
        iconSrc="/icons/trash.svg"
        confirmIcon={<Image src="/icons/trash-white.svg" alt="" width={15} height={15} />}
        isLoading={isActionLoading}
      />
    </div>
  );
}
