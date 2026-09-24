import { tasksService } from './tasksService';
import { apiClient } from '@/services/api';

jest.mock('@/services/api');

describe('tasksService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('calls /tasks with no query string by default', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await tasksService.getTasks();
      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
    });

    it('builds a full query string from all params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await tasksService.getTasks({
        projectId: 'proj-1',
        page: 1,
        limit: 20,
        search: 'login',
        status: 'Done',
        assigneeId: 'user-1',
        priority: 'High',
        type: 'Bug',
      });
      expect(apiClient.get).toHaveBeenCalledWith(
        '/tasks?projectId=proj-1&page=1&limit=20&search=login&status=Done&assigneeId=user-1&priority=High&type=Bug'
      );
    });

    it('omits "all" filter values', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await tasksService.getTasks({
        status: 'all',
        priority: 'all',
        type: 'all',
        assigneeId: 'all',
      });
      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
    });
  });

  it('getBoardTasks calls the board endpoint with projectId', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
    await tasksService.getBoardTasks('proj-1');
    expect(apiClient.get).toHaveBeenCalledWith('/tasks/board?projectId=proj-1');
  });

  it('getTaskById calls the correct endpoint', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
    await tasksService.getTaskById('ENG-1');
    expect(apiClient.get).toHaveBeenCalledWith('/tasks/ENG-1');
  });

  it('createTask posts the payload', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
    const payload = { projectId: 'proj-1', title: 'Fix bug' };
    await tasksService.createTask(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/tasks', payload);
  });

  it('updateTask puts the payload to the correct endpoint', async () => {
    (apiClient.put as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
    await tasksService.updateTask('ENG-1', { title: 'New title' });
    expect(apiClient.put).toHaveBeenCalledWith('/tasks/ENG-1', { title: 'New title' });
  });

  it('updateTaskStatus patches the status endpoint', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
    await tasksService.updateTaskStatus('ENG-1', { status: 'Done', order: 2 });
    expect(apiClient.patch).toHaveBeenCalledWith('/tasks/ENG-1/status', {
      status: 'Done',
      order: 2,
    });
  });

  it('deleteTask calls delete on the correct endpoint', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({ success: true, message: 'ok' });
    await tasksService.deleteTask('ENG-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/tasks/ENG-1');
  });

  it('getTaskActivity calls the correct endpoint', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
    await tasksService.getTaskActivity('ENG-1');
    expect(apiClient.get).toHaveBeenCalledWith('/tasks/ENG-1/activity');
  });

  describe('comments', () => {
    it('getComments calls the correct endpoint', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await tasksService.getComments('ENG-1');
      expect(apiClient.get).toHaveBeenCalledWith('/tasks/ENG-1/comments');
    });

    it('createComment posts the comment body', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
      await tasksService.createComment('ENG-1', 'Looks good');
      expect(apiClient.post).toHaveBeenCalledWith('/tasks/ENG-1/comments', { body: 'Looks good' });
    });

    it('deleteComment calls delete on the correct endpoint', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({ success: true, message: 'ok' });
      await tasksService.deleteComment('ENG-1', 'c1');
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/ENG-1/comments/c1');
    });
  });

  describe('attachments', () => {
    it('getAttachments calls the correct endpoint', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
      await tasksService.getAttachments('ENG-1');
      expect(apiClient.get).toHaveBeenCalledWith('/tasks/ENG-1/attachments');
    });

    it('uploadAttachment builds a FormData payload and uploads it', async () => {
      (apiClient.upload as jest.Mock).mockResolvedValueOnce({ success: true, data: {} });
      const file = new File(['content'], 'diagram.png', { type: 'image/png' });

      await tasksService.uploadAttachment('ENG-1', file);

      expect(apiClient.upload).toHaveBeenCalledWith(
        '/tasks/ENG-1/attachments',
        expect.any(FormData)
      );
      const formData = (apiClient.upload as jest.Mock).mock.calls[0][1] as FormData;
      expect(formData.get('file')).toBe(file);
    });

    it('downloadAttachment calls downloadBlob on the correct endpoint', async () => {
      const mockBlob = new Blob(['content']);
      (apiClient.downloadBlob as jest.Mock).mockResolvedValueOnce(mockBlob);

      const result = await tasksService.downloadAttachment('ENG-1', 'att-1');

      expect(apiClient.downloadBlob).toHaveBeenCalledWith('/tasks/ENG-1/attachments/att-1');
      expect(result).toBe(mockBlob);
    });

    it('deleteAttachment calls delete on the correct endpoint', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({ success: true, message: 'ok' });
      await tasksService.deleteAttachment('ENG-1', 'att-1');
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/ENG-1/attachments/att-1');
    });
  });
});
