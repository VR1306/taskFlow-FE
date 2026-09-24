import { ProjectMember } from '@/types/projects/projects';

export type TaskStatus = 'Todo' | 'In Progress' | 'In Review' | 'Done';
export type TaskType = 'Task' | 'Story' | 'Bug';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

/** A user reference that may arrive populated (object) or unpopulated (raw id) */
export type PopulatedUserRef = ProjectMember | string | null;

export interface Task {
  id?: string;
  _id?: string;
  taskKey: string;
  projectId: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: PopulatedUserRef;
  reporterId?: PopulatedUserRef;
  labels?: string[];
  dueDate?: string | null;
  order: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TasksPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TasksResponse {
  success: boolean;
  pagination: TasksPagination;
  data: Task[];
}

export interface BoardTasksResponse {
  success: boolean;
  data: Task[];
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data: Task;
}

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labels?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labels?: string[];
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
  order?: number;
}

export interface TasksFilter {
  projectId?: string;
  search?: string;
  status?: TaskStatus | 'all';
  assigneeId?: string;
  priority?: TaskPriority | 'all';
  type?: TaskType | 'all';
}

export interface Comment {
  id?: string;
  _id?: string;
  commentId: string;
  taskId: string;
  authorId?: PopulatedUserRef;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
}

export interface CommentResponse {
  success: boolean;
  message?: string;
  data: Comment;
}

export interface Attachment {
  id?: string;
  _id?: string;
  attachmentId: string;
  taskId: string;
  uploaderId?: PopulatedUserRef;
  filename: string;
  mimetype: string;
  size: number;
  createdAt?: string;
}

export interface AttachmentsResponse {
  success: boolean;
  data: Attachment[];
}

export interface AttachmentResponse {
  success: boolean;
  message?: string;
  data: Attachment;
}

export type ActivityAction =
  'created' | 'status_changed' | 'assigned' | 'priority_changed' | 'commented' | 'attachment_added';

export interface ActivityEntry {
  id?: string;
  _id?: string;
  activityId: string;
  taskId: string;
  actorId?: string | null;
  actorName?: string;
  action: ActivityAction;
  fromValue?: string | null;
  toValue?: string | null;
  message: string;
  createdAt?: string;
}

export interface ActivityResponse {
  success: boolean;
  data: ActivityEntry[];
}
