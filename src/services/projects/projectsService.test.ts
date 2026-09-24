import { projectsService } from './projectsService';
import { apiClient } from '@/services/api';

jest.mock('@/services/api');

describe('projectsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('calls /projects with no query string by default', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await projectsService.getProjects();
      expect(apiClient.get).toHaveBeenCalledWith('/projects');
    });

    it('builds a full query string from all params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await projectsService.getProjects({ page: 2, limit: 10, search: 'Eng', status: 'active' });
      expect(apiClient.get).toHaveBeenCalledWith(
        '/projects?page=2&limit=10&search=Eng&status=active'
      );
    });

    it('omits status when set to "all"', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await projectsService.getProjects({ status: 'all' });
      expect(apiClient.get).toHaveBeenCalledWith('/projects');
    });
  });

  it('getProjectById calls the correct endpoint', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
    await projectsService.getProjectById('PRJ0001');
    expect(apiClient.get).toHaveBeenCalledWith('/projects/PRJ0001');
  });

  it('getMemberCandidates calls the correct endpoint', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
    await projectsService.getMemberCandidates();
    expect(apiClient.get).toHaveBeenCalledWith('/projects/member-candidates');
  });

  it('createProject posts the payload', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
    const payload = { name: 'Engineering' };
    await projectsService.createProject(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/projects', payload);
  });

  it('updateProject puts the payload to the correct endpoint', async () => {
    (apiClient.put as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
    const payload = { name: 'Engineering Team' };
    await projectsService.updateProject('proj-1', payload);
    expect(apiClient.put).toHaveBeenCalledWith('/projects/proj-1', payload);
  });

  it('deleteProject calls delete on the correct endpoint', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({ success: true, message: 'ok' });
    await projectsService.deleteProject('proj-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/projects/proj-1');
  });
});
