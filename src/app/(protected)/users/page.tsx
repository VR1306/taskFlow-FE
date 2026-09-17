'use client';

import React, { useEffect, useMemo, useCallback, useState, memo } from 'react';
import { Button, Loader, Avatar, Pagination, Image, ConfirmationModal } from '@/components/ui';
import { UserActionsMenu, CreateUserModal, ViewUserModal, EditUserModal } from '@/components/users';
import { getRoleBadgeClass } from '@/helpers';
import {
  useAppDispatch,
  useAppSelector,
  fetchUsers,
  setCurrentPage,
  setLimit,
  deleteUserThunk,
  UserRecord,
} from '@/store';

// Memoized table row component for high-performance rendering
interface UserTableRowProps {
  user: UserRecord;
  onView: (user: UserRecord) => void;
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
}

const UserTableRow = memo(function UserTableRow({
  user,
  onView,
  onEdit,
  onDelete,
}: UserTableRowProps) {
  const roleBadgeStyle = useMemo(() => getRoleBadgeClass(user.role), [user.role]);

  return (
    <tr className="hover:bg-slate-50/70 transition-colors duration-150">
      {/* User Avatar + Name */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 block truncate">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-medium text-xs sm:text-sm">
        {user.email}
      </td>

      {/* Role */}
      <td className="px-5 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeStyle}`}
        >
          {user.role}
        </span>
      </td>

      {/* Sequential Display User ID (TF0001 format) */}
      <td className="px-5 py-4 whitespace-nowrap">
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 rounded-md px-2 py-0.5 select-all">
          {user.userId || 'TF0001'}
        </span>
      </td>

      {/* Actions Column (3-dots menu) */}
      <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-medium">
        <UserActionsMenu user={user} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
});

UserTableRow.displayName = 'UserTableRow';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const {
    cachedPages,
    currentPage,
    limit,
    totalItems,
    totalPages,
    isLoading,
    isActionLoading,
    error,
  } = useAppSelector((state) => state.users);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<UserRecord | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserRecord | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserRecord | null>(null);

  // 1. Fetch users on mount or when page/limit changes
  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  // 2. Pagination change handlers
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

  // 3. User action triggers
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleViewUser = useCallback((user: UserRecord) => {
    setSelectedUserForView(user);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setSelectedUserForView(null);
  }, []);

  const handleEditUser = useCallback((user: UserRecord) => {
    setSelectedUserForEdit(user);
  }, []);

  const handleCloseEditModal = useCallback(() => {
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

  // 4. Memoized users list from active page cache
  const cacheKey = `${currentPage}-${limit}`;
  const users = useMemo(() => {
    return cachedPages[cacheKey]?.data || [];
  }, [cachedPages, cacheKey]);

  return (
    <div className="space-y-6">
      {/* Header section with clean Title and '+ Create User' button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
            Manage team members, roles, and access permissions across your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto text-xs font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/25 gap-2 py-2.5 px-4"
          >
            <Image src="/icons/plus.svg" alt="" width={15} height={15} className="brightness-200" />
            <span>Create User</span>
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
            onClick={() => dispatch(fetchUsers({ page: currentPage, limit, forceRefresh: true }))}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading && users.length === 0 ? (
        <div className="flex justify-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Loader text="Loading team members..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Card Top Title */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
              All Members ({totalItems > 0 ? totalItems : users.length})
            </h2>
            {isLoading && (
              <span className="text-xs text-blue-600 animate-pulse font-medium">Updating...</span>
            )}
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto min-h-[160px]">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    User
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Email
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Role
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    User ID
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No user records found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserTableRow
                      key={user._id}
                      user={user}
                      onView={handleViewUser}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* React Pagination Component */}
          {totalItems > 0 && (
            <div className="border-t border-slate-100 px-4 sm:px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={Boolean(selectedUserForView)}
        onClose={handleCloseViewModal}
        user={selectedUserForView}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={Boolean(selectedUserForEdit)}
        onClose={handleCloseEditModal}
        user={selectedUserForEdit}
      />

      {/* Delete User Confirmation Modal (Soft delete) */}
      <ConfirmationModal
        isOpen={Boolean(selectedUserForDelete)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete ${selectedUserForDelete?.firstName} ${selectedUserForDelete?.lastName} (${selectedUserForDelete?.userId || 'TF0001'})? This user will be soft-deleted and removed from active workspace members.`}
        confirmText="Delete User"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isActionLoading}
      />
    </div>
  );
}
