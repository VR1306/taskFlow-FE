'use client';

import React, { memo, useEffect } from 'react';
import { Drawer, Button, Badge, Image } from '@/components/ui';
import { DynamicPermissionsSelector } from './DynamicPermissionsSelector';
import { useAppDispatch, useAppSelector, fetchPermissionsCatalogue } from '@/store';
import { ROLES_CONSTANTS } from '@/constants';
import { getRoleTypeBadgeVariant, formatDate } from '@/helpers';
import { RoleRecord, PermissionModule } from '@/types';

export interface ViewRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleRecord | null;
  permissionsCatalogue?: PermissionModule[];
  onEdit?: (role: RoleRecord) => void;
  canEdit?: boolean;
}

export const NOOP_PERM_CHANGE = () => {};

export const ViewRoleDrawer = memo(function ViewRoleDrawer({
  isOpen,
  onClose,
  role,
  permissionsCatalogue: propCatalogue,
  onEdit,
  canEdit = true,
}: Readonly<ViewRoleDrawerProps>) {
  const dispatch = useAppDispatch();
  const storeCatalogue = useAppSelector((state) => state?.roles?.permissionsCatalogue || []);
  const permissionsCatalogue = propCatalogue || storeCatalogue;

  useEffect(() => {
    if (isOpen && !propCatalogue) {
      dispatch(fetchPermissionsCatalogue());
    }
  }, [isOpen, propCatalogue, dispatch]);

  if (!role) return null;

  const roleDisplayName = role.name || role.roleName || 'Role';
  const roleDesc = role.description || role.roleDescription || '';
  const rolePerms = role.permissions || role.rolePermissions || [];
  const isRoleActive = role.isActive !== false;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={ROLES_CONSTANTS.viewDrawer.title}
      description={ROLES_CONSTANTS.viewDrawer.description}
      width="xl"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs sm:text-sm font-semibold py-2.5 px-4"
          >
            {ROLES_CONSTANTS.viewDrawer.closeButtonText}
          </Button>
          {canEdit && onEdit && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(role);
              }}
              leftIcon={<Image src="/icons/edit-white.svg" alt="" width={15} height={15} />}
              className="text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 py-2.5 px-4"
            >
              {ROLES_CONSTANTS.viewDrawer.editButtonText}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Role Summary Hero Card */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200/90 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {roleDisplayName}
                </h3>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/80">
                  {role.roleId || role.id}
                </span>
              </div>
              {roleDesc ? (
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {roleDesc}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1.5">No description provided.</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Badge variant={getRoleTypeBadgeVariant(role.roleType)}>
                {role.roleType || 'Custom'}
              </Badge>
              <Badge variant={isRoleActive ? 'success' : 'danger'}>
                {isRoleActive ? 'Active' : 'Inactive'}
              </Badge>
              {role.isSystem && (
                <Badge variant="purple">{ROLES_CONSTANTS.viewDrawer.systemBadgeText}</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3.5 border-t border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">
                Created Date
              </span>
              <span className="font-semibold text-slate-800" suppressHydrationWarning>
                {formatDate(role.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">
                Granted Capabilities
              </span>
              <span className="font-semibold text-slate-800">{rolePerms.length} Permissions</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">
                System Classification
              </span>
              <span className="font-semibold text-slate-800">
                {role.isSystem ? 'System Core' : 'Custom Defined'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Granted Permissions Matrix */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Granted Permissions
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Review all module operations and security rights authorized for this role.
            </p>
          </div>

          <DynamicPermissionsSelector
            permissionsCatalogue={permissionsCatalogue}
            selectedPermissions={rolePerms}
            onChange={NOOP_PERM_CHANGE}
            isReadOnly={true}
          />
        </div>
      </div>
    </Drawer>
  );
});

ViewRoleDrawer.displayName = 'ViewRoleDrawer';
export default ViewRoleDrawer;
