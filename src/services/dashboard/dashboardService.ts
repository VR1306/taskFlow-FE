import { apiClient } from '@/services/api';
import { DashboardStatsResponse } from '@/types';

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    return apiClient.get<DashboardStatsResponse>('/dashboard/stats');
  },
};
