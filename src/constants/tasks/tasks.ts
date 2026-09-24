import { SelectOption } from '@/components/ui/Select';
import { TaskStatus, TaskType, TaskPriority } from '@/types';

export const TASK_STATUS_COLUMNS: TaskStatus[] = ['Todo', 'In Progress', 'In Review', 'Done'];

export const TASK_STATUS_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Todo', label: 'Todo' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'In Review', label: 'In Review' },
  { value: 'Done', label: 'Done' },
];

export const TASK_TYPE_OPTIONS: SelectOption<TaskType>[] = [
  { value: 'Task', label: 'Task' },
  { value: 'Story', label: 'Story' },
  { value: 'Bug', label: 'Bug' },
];

export const TASK_TYPE_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Types' },
  { value: 'Task', label: 'Task' },
  { value: 'Story', label: 'Story' },
  { value: 'Bug', label: 'Bug' },
];

export const TASK_PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

export const TASK_PRIORITY_FILTER_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

export const TASK_TYPE_BADGE_CLASSES: Record<TaskType, string> = {
  Task: 'bg-blue-50 text-blue-700 border-blue-200',
  Story: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Bug: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const TASK_PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const TASK_STATUS_COLUMN_STYLES: Record<TaskStatus, { header: string; dot: string }> = {
  Todo: { header: 'text-slate-600', dot: 'bg-slate-400' },
  'In Progress': { header: 'text-blue-600', dot: 'bg-blue-500' },
  'In Review': { header: 'text-amber-600', dot: 'bg-amber-500' },
  Done: { header: 'text-emerald-600', dot: 'bg-emerald-500' },
};

export const TASKS_CONSTANTS = {
  boardSearchPlaceholder: 'Search tasks by title or key...',
  createTaskButtonText: 'Create Task',
  filterButtonText: 'Filter',
  backToProjectsText: 'Back to Projects',
  loadingBoardText: 'Loading board...',
  emptyColumnText: 'No tasks',
  refreshingText: 'Syncing...',

  filterDrawer: {
    title: 'Filter Tasks',
    description: 'Refine the board by assignee, priority, or type.',
    assigneeLabel: 'Assignee',
    priorityLabel: 'Priority',
    typeLabel: 'Type',
    applyButtonText: 'Apply Filters',
    resetButtonText: 'Reset Filters',
  },

  createDrawer: {
    title: 'Create New Task',
    description: 'Add a new work item to this project board.',
    titleLabel: 'Title',
    titlePlaceholder: 'e.g. Fix broken checkout flow',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Add more context about this task...',
    typeLabel: 'Type',
    priorityLabel: 'Priority',
    assigneeLabel: 'Assignee',
    unassignedOption: 'Unassigned',
    dueDateLabel: 'Due Date',
    labelsLabel: 'Labels',
    labelsPlaceholder: 'Type a label and press Enter',
    submitButtonText: 'Create Task',
    submittingButtonText: 'Creating...',
    cancelButtonText: 'Cancel',
    defaultError: 'Failed to create task. Please try again.',
  },

  detailDrawer: {
    tabs: {
      details: 'Details',
      comments: 'Comments',
      attachments: 'Attachments',
      activity: 'Activity',
    },
    statusLabel: 'Status',
    priorityLabel: 'Priority',
    typeLabel: 'Type',
    assigneeLabel: 'Assignee',
    reporterLabel: 'Reporter',
    dueDateLabel: 'Due Date',
    labelsLabel: 'Labels',
    descriptionLabel: 'Description',
    noDescription: 'No description provided.',
    saveButtonText: 'Save Changes',
    savingButtonText: 'Saving...',
    deleteButtonText: 'Delete Task',
    commentPlaceholder: 'Add a comment...',
    postCommentButtonText: 'Comment',
    noComments: 'No comments yet. Be the first to add one.',
    noAttachments: 'No attachments yet.',
    uploadAttachmentButtonText: 'Upload File',
    uploadingText: 'Uploading...',
    noActivity: 'No activity recorded yet.',
    maxAttachmentSizeHint: 'Maximum file size: 4 MB.',
  },

  deleteModal: {
    title: 'Delete Task',
    message: (title: string) =>
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
    confirmButtonText: 'Delete Task',
  },
} as const;

export default TASKS_CONSTANTS;
