import { apiClient } from '@/services/api';
import {
  TasksResponse,
  BoardTasksResponse,
  TaskResponse,
  CommentsResponse,
  CommentResponse,
  AttachmentsResponse,
  AttachmentResponse,
  ActivityResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from '@/types';

export interface FetchTasksParams {
  projectId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assigneeId?: string;
  priority?: string;
  type?: string;
}

export const tasksService = {
  getTasks: async (params: Readonly<FetchTasksParams> = {}): Promise<TasksResponse> => {
    const query = new URLSearchParams();
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search.trim());
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.assigneeId && params.assigneeId !== 'all')
      query.set('assigneeId', params.assigneeId);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.type && params.type !== 'all') query.set('type', params.type);

    const queryString = query.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return apiClient.get<TasksResponse>(endpoint);
  },

  getBoardTasks: async (projectId: string): Promise<BoardTasksResponse> => {
    return apiClient.get<BoardTasksResponse>(
      `/tasks/board?projectId=${encodeURIComponent(projectId)}`
    );
  },

  getTaskById: async (id: string): Promise<TaskResponse> => {
    return apiClient.get<TaskResponse>(`/tasks/${encodeURIComponent(id)}`);
  },

  createTask: async (payload: Readonly<CreateTaskPayload>): Promise<TaskResponse> => {
    return apiClient.post<TaskResponse>('/tasks', payload);
  },

  updateTask: async (id: string, payload: Readonly<UpdateTaskPayload>): Promise<TaskResponse> => {
    return apiClient.put<TaskResponse>(`/tasks/${encodeURIComponent(id)}`, payload);
  },

  updateTaskStatus: async (
    id: string,
    payload: Readonly<UpdateTaskStatusPayload>
  ): Promise<TaskResponse> => {
    return apiClient.patch<TaskResponse>(`/tasks/${encodeURIComponent(id)}/status`, payload);
  },

  deleteTask: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/tasks/${encodeURIComponent(id)}`
    );
  },

  getTaskActivity: async (id: string): Promise<ActivityResponse> => {
    return apiClient.get<ActivityResponse>(`/tasks/${encodeURIComponent(id)}/activity`);
  },

  getComments: async (taskId: string): Promise<CommentsResponse> => {
    return apiClient.get<CommentsResponse>(`/tasks/${encodeURIComponent(taskId)}/comments`);
  },

  createComment: async (taskId: string, body: string): Promise<CommentResponse> => {
    return apiClient.post<CommentResponse>(`/tasks/${encodeURIComponent(taskId)}/comments`, {
      body,
    });
  },

  deleteComment: async (
    taskId: string,
    commentId: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/tasks/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(commentId)}`
    );
  },

  getAttachments: async (taskId: string): Promise<AttachmentsResponse> => {
    return apiClient.get<AttachmentsResponse>(`/tasks/${encodeURIComponent(taskId)}/attachments`);
  },

  uploadAttachment: async (taskId: string, file: File): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<AttachmentResponse>(
      `/tasks/${encodeURIComponent(taskId)}/attachments`,
      formData
    );
  },

  downloadAttachment: async (taskId: string, attachmentId: string): Promise<Blob> => {
    return apiClient.downloadBlob(
      `/tasks/${encodeURIComponent(taskId)}/attachments/${encodeURIComponent(attachmentId)}`
    );
  },

  deleteAttachment: async (
    taskId: string,
    attachmentId: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/tasks/${encodeURIComponent(taskId)}/attachments/${encodeURIComponent(attachmentId)}`
    );
  },
};

export default tasksService;
