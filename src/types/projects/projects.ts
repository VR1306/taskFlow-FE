export interface ProjectMember {
  id?: string;
  _id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
  profilePic?: string;
  isActive?: boolean;
}

export type ProjectStatus = 'active' | 'archived';

export interface Project {
  id?: string;
  _id?: string;
  projectId?: string;
  key: string;
  name: string;
  description?: string;
  leadId?: ProjectMember | string | null;
  members?: (ProjectMember | string)[];
  memberCount?: number;
  taskCount?: number;
  status: ProjectStatus;
  taskSequence?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectsPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProjectsResponse {
  success: boolean;
  pagination: ProjectsPagination;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}

export interface CreateProjectPayload {
  name: string;
  key?: string;
  description?: string;
  leadId?: string;
  memberIds?: string[];
  status?: ProjectStatus;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  leadId?: string;
  memberIds?: string[];
}

export interface ProjectsFilter {
  search?: string;
  status?: ProjectStatus | 'all';
}

export interface ProjectMemberCandidatesResponse {
  success: boolean;
  data: ProjectMember[];
}
