import { apiClient } from '@/services/api';
import {
  ProjectsResponse,
  ProjectResponse,
  ProjectMemberCandidatesResponse,
  CreateProjectPayload,
  UpdateProjectPayload,
} from '@/types';

export interface FetchProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const projectsService = {
  getProjects: async (params: Readonly<FetchProjectsParams> = {}): Promise<ProjectsResponse> => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search.trim());
    if (params.status && params.status !== 'all') query.set('status', params.status);

    const queryString = query.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    return apiClient.get<ProjectsResponse>(endpoint);
  },

  getProjectById: async (id: string): Promise<ProjectResponse> => {
    return apiClient.get<ProjectResponse>(`/projects/${encodeURIComponent(id)}`);
  },

  getMemberCandidates: async (): Promise<ProjectMemberCandidatesResponse> => {
    return apiClient.get<ProjectMemberCandidatesResponse>('/projects/member-candidates');
  },

  createProject: async (payload: Readonly<CreateProjectPayload>): Promise<ProjectResponse> => {
    return apiClient.post<ProjectResponse>('/projects', payload);
  },

  updateProject: async (
    id: string,
    payload: Readonly<UpdateProjectPayload>
  ): Promise<ProjectResponse> => {
    return apiClient.put<ProjectResponse>(`/projects/${encodeURIComponent(id)}`, payload);
  },

  deleteProject: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/projects/${encodeURIComponent(id)}`
    );
  },
};

export default projectsService;
