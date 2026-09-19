export type RoleType = 'Super Admin' | 'Admin' | 'Manager' | 'User' | 'Guest' | 'Custom';

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'export';
}

export interface PermissionModule {
  moduleKey: string;
  moduleName: string;
  description: string;
  icon?: string;
  permissions: PermissionItem[];
}

export interface RoleRecord {
  _id: string;
  id?: string;
  roleId: string;
  name?: string;
  roleName?: string;
  description?: string;
  roleDescription?: string;
  roleType: RoleType;
  permissions?: string[];
  rolePermissions?: string[];
  isSystem: boolean;
  isActive?: boolean;
  status?: 'Active' | 'Inactive';
  userCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RoleFilters {
  roleType?: string;
  status?: string;
}

export interface CreateRolePayload {
  name?: string;
  roleName?: string;
  description?: string;
  roleDescription?: string;
  roleType?: RoleType;
  permissions?: string[];
  rolePermissions?: string[];
  isActive?: boolean;
  status?: 'Active' | 'Inactive';
}

export interface UpdateRolePayload {
  name?: string;
  roleName?: string;
  description?: string;
  roleDescription?: string;
  roleType?: RoleType;
  permissions?: string[];
  rolePermissions?: string[];
  isActive?: boolean;
  status?: 'Active' | 'Inactive';
}

export interface RolePaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface RolesApiResponse {
  success: boolean;
  pagination: RolePaginationMeta;
  data: RoleRecord[];
  message?: string;
}

export interface SingleRoleApiResponse {
  success: boolean;
  data: RoleRecord;
  message?: string;
}

export interface PermissionsCatalogueApiResponse {
  success: boolean;
  data: PermissionModule[];
  message?: string;
}
