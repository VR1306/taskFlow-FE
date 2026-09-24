export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  activeRoles: number;
  totalPermissions: number;
  totalProjects: number;
  totalTasks: number;
}

export interface RoleDistributionItem {
  role: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RoleTypeDistributionItem {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RegistrationTrendItem {
  month: string;
  year: number;
  count: number;
}

export interface RolePermissionItem {
  roleName: string;
  permissionsCount: number;
  usersCount: number;
}

export interface RecentUserItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface RecentRoleItem {
  id: string;
  roleId: string;
  name: string;
  roleType: string;
  permissionsCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface TaskStatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardStats {
  summary: DashboardSummary;
  usersByRole: RoleDistributionItem[];
  usersByStatus: StatusDistributionItem[];
  rolesByType: RoleTypeDistributionItem[];
  tasksByStatus: TaskStatusDistributionItem[];
  userRegistrationTrends: RegistrationTrendItem[];
  rolePermissionsDistribution: RolePermissionItem[];
  recentUsers: RecentUserItem[];
  recentRoles: RecentRoleItem[];
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}
