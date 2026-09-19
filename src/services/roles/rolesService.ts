import { apiClient } from '@/services/api';
import {
  RolesApiResponse,
  SingleRoleApiResponse,
  PermissionsCatalogueApiResponse,
  CreateRolePayload,
  UpdateRolePayload,
} from '@/types';

export interface FetchRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  roleType?: string;
  status?: string;
}

export const rolesService = {
  getRoles: async (params: Readonly<FetchRolesParams> = {}): Promise<RolesApiResponse> => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search.trim());
    if (params.roleType && params.roleType !== 'all') query.set('roleType', params.roleType);
    if (params.status && params.status !== 'all') query.set('status', params.status);

    const queryString = query.toString();
    const endpoint = queryString ? `/roles?${queryString}` : '/roles';
    return apiClient.get<RolesApiResponse>(endpoint);
  },

  getPermissionsCatalogue: async (): Promise<PermissionsCatalogueApiResponse> => {
    return apiClient.get<PermissionsCatalogueApiResponse>('/roles/permissions');
  },

  getRoleById: async (id: string): Promise<SingleRoleApiResponse> => {
    return apiClient.get<SingleRoleApiResponse>(`/roles/${encodeURIComponent(id)}`);
  },

  createRole: async (payload: Readonly<CreateRolePayload>): Promise<SingleRoleApiResponse> => {
    return apiClient.post<SingleRoleApiResponse>('/roles', payload);
  },

  updateRole: async (
    id: string,
    payload: Readonly<UpdateRolePayload>
  ): Promise<SingleRoleApiResponse> => {
    return apiClient.put<SingleRoleApiResponse>(`/roles/${encodeURIComponent(id)}`, payload);
  },

  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/roles/${encodeURIComponent(id)}`
    );
  },
};

export default rolesService;
