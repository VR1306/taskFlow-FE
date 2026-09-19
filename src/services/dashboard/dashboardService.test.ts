import { dashboardService } from './dashboardService';
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('dashboardService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls apiClient.get with /dashboard/stats and returns data', async () => {
    const mockResponse = {
      success: true,
      data: {
        summary: {
          totalUsers: 5,
          activeUsers: 4,
          inactiveUsers: 1,
          totalRoles: 3,
          systemRoles: 3,
          customRoles: 0,
          activeRoles: 3,
          totalPermissions: 28,
        },
        usersByRole: [],
        usersByStatus: [],
        rolesByType: [],
        userRegistrationTrends: [],
        rolePermissionsDistribution: [],
        recentUsers: [],
        recentRoles: [],
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await dashboardService.getDashboardStats();

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/stats');
    expect(result).toEqual(mockResponse);
  });
});
