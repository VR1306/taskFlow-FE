import { rolesService } from './rolesService';
import { apiClient } from '@/services/api';

jest.mock('@/services/api');

describe('rolesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('calls /roles with default empty query parameters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const res = await rolesService.getRoles();
      expect(apiClient.get).toHaveBeenCalledWith('/roles');
      expect(res.success).toBe(true);
    });

    it('builds query string correctly with all parameters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await rolesService.getRoles({
        page: 2,
        limit: 25,
        search: 'Manager',
        roleType: 'Admin',
        status: 'Active',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/roles?page=2&limit=25&search=Manager&roleType=Admin&status=Active'
      );
    });

    it('ignores "all" roleType and status values in query params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await rolesService.getRoles({
        page: 1,
        roleType: 'all',
        status: 'all',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/roles?page=1');
    });
  });

  describe('getPermissionsCatalogue', () => {
    it('calls /roles/permissions endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [],
          roles: [],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const res = await rolesService.getPermissionsCatalogue();
      expect(apiClient.get).toHaveBeenCalledWith('/roles/permissions');
      expect(res).toEqual(mockResponse);
    });
  });

  describe('getRoleById', () => {
    it('calls /roles/:id endpoint with encoded identifier', async () => {
      const mockRole = {
        success: true,
        data: { _id: '123', roleName: 'Developer' },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockRole);

      const res = await rolesService.getRoleById('RL 001');
      expect(apiClient.get).toHaveBeenCalledWith('/roles/RL%20001');
      expect(res).toEqual(mockRole);
    });
  });

  describe('createRole', () => {
    it('calls POST /roles with payload', async () => {
      const payload = {
        roleName: 'QA Engineer',
        roleDescription: 'Quality Assurance',
        roleType: 'User' as const,
        rolePermissions: ['tasks.view'],
        status: 'Active' as const,
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { _id: 'qa-1', ...payload },
      });

      const res = await rolesService.createRole(payload);
      expect(apiClient.post).toHaveBeenCalledWith('/roles', payload);
      expect(res.success).toBe(true);
    });
  });

  describe('updateRole', () => {
    it('calls PUT /roles/:id with payload', async () => {
      const payload = {
        roleName: 'Senior QA Engineer',
      };
      (apiClient.put as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { _id: 'qa-1', roleName: 'Senior QA Engineer' },
      });

      const res = await rolesService.updateRole('qa-1', payload);
      expect(apiClient.put).toHaveBeenCalledWith('/roles/qa-1', payload);
      expect(res.success).toBe(true);
    });
  });

  describe('deleteRole', () => {
    it('calls DELETE /roles/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Role deleted successfully',
      });

      const res = await rolesService.deleteRole('qa-1');
      expect(apiClient.delete).toHaveBeenCalledWith('/roles/qa-1');
      expect(res.success).toBe(true);
    });
  });
});
