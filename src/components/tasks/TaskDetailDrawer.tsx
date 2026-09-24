'use client';

import React, { memo, useState, useEffect, useCallback, useMemo, useId } from 'react';
import { Drawer, Select, Button, Image, Avatar, Loader, ConfirmationModal } from '@/components/ui';
import { useAppDispatch, updateTaskThunk, updateTaskStatusThunk, deleteTaskThunk } from '@/store';
import { tasksService } from '@/services';
import { formatDate, formatRelativeTime, useCurrentUser } from '@/helpers';
import { TASKS_CONSTANTS, TASK_STATUS_FILTER_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/constants';
import {
  Task,
  TaskStatus,
  TaskPriority,
  ProjectMember,
  Comment as TaskComment,
  Attachment,
  ActivityEntry,
} from '@/types';

export interface TaskDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  members: ProjectMember[];
  onDeleted?: () => void;
}

type DetailTab = 'details' | 'comments' | 'attachments' | 'activity';

const statusOptions = TASK_STATUS_FILTER_OPTIONS.filter((opt) => opt.value !== 'all');

const resolveMember = (value?: ProjectMember | string | null): ProjectMember | null =>
  value && typeof value === 'object' ? value : null;

const memberLabel = (m: ProjectMember): string =>
  `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Unnamed';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const TaskDetailDrawer = memo(function TaskDetailDrawer({
  isOpen,
  onClose,
  task,
  members,
  onDeleted,
}: TaskDetailDrawerProps) {
  const dispatch = useAppDispatch();
  const currentUser = useCurrentUser();

  const [activeTab, setActiveTab] = useState<DetailTab>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAttachmentsLoading, setIsAttachmentsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  const titleInputId = useId();
  const descInputId = useId();
  const dueDateInputId = useId();
  const fileInputId = useId();

  const taskIdentifier = task?._id || '';

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
      setDetailsError(null);
      setActiveTab('details');
    }
  }, [task, isOpen]);

  const loadComments = useCallback(async () => {
    setIsCommentsLoading(true);
    try {
      const res = await tasksService.getComments(taskIdentifier);
      setComments(res.data || []);
    } catch {
      // Silently keep the previous list on transient failure
    } finally {
      setIsCommentsLoading(false);
    }
  }, [taskIdentifier]);

  const loadAttachments = useCallback(async () => {
    setIsAttachmentsLoading(true);
    try {
      const res = await tasksService.getAttachments(taskIdentifier);
      setAttachments(res.data || []);
    } catch {
      // Silently keep the previous list on transient failure
    } finally {
      setIsAttachmentsLoading(false);
    }
  }, [taskIdentifier]);

  const loadActivity = useCallback(async () => {
    setIsActivityLoading(true);
    try {
      const res = await tasksService.getTaskActivity(taskIdentifier);
      setActivity(res.data || []);
    } catch {
      // Silently keep the previous list on transient failure
    } finally {
      setIsActivityLoading(false);
    }
  }, [taskIdentifier]);

  useEffect(() => {
    if (!isOpen || !taskIdentifier) return;
    if (activeTab === 'comments' && comments.length === 0) loadComments();
    if (activeTab === 'attachments' && attachments.length === 0) loadAttachments();
    if (activeTab === 'activity' && activity.length === 0) loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, taskIdentifier]);

  const assignee = resolveMember(task?.assigneeId);
  const reporter = resolveMember(task?.reporterId);

  const assigneeOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...members.map((m) => ({ value: m._id || '', label: memberLabel(m) })),
    ],
    [members]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      dispatch(
        updateTaskStatusThunk({ id: taskIdentifier, data: { status: status as TaskStatus } })
      );
    },
    [dispatch, taskIdentifier]
  );

  const handlePriorityChange = useCallback(
    (priority: string) => {
      dispatch(
        updateTaskThunk({ id: taskIdentifier, data: { priority: priority as TaskPriority } })
      );
    },
    [dispatch, taskIdentifier]
  );

  const handleAssigneeChange = useCallback(
    (value: string) => {
      dispatch(updateTaskThunk({ id: taskIdentifier, data: { assigneeId: value || null } }));
    },
    [dispatch, taskIdentifier]
  );

  const handleSaveDetails = useCallback(async () => {
    setIsSavingDetails(true);
    setDetailsError(null);
    const resultAction = await dispatch(
      updateTaskThunk({
        id: taskIdentifier,
        data: { title: title.trim(), description: description.trim(), dueDate: dueDate || null },
      })
    );
    setIsSavingDetails(false);
    if (!updateTaskThunk.fulfilled.match(resultAction)) {
      setDetailsError((resultAction.payload as string) || 'Failed to save changes.');
    }
  }, [dispatch, taskIdentifier, title, description, dueDate]);

  const handlePostComment = useCallback(async () => {
    setIsPostingComment(true);
    try {
      await tasksService.createComment(taskIdentifier, commentInput.trim());
      setCommentInput('');
      await loadComments();
    } catch {
      // Keep the draft comment on failure so the user can retry
    } finally {
      setIsPostingComment(false);
    }
  }, [commentInput, taskIdentifier, loadComments]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setIsUploading(true);
      try {
        await tasksService.uploadAttachment(taskIdentifier, file);
        await loadAttachments();
      } catch {
        // No-op — attachment list simply won't include the failed upload
      } finally {
        setIsUploading(false);
      }
    },
    [taskIdentifier, loadAttachments]
  );

  const handleDownloadAttachment = useCallback(
    async (attachment: Attachment) => {
      const attachmentId = attachment._id || attachment.attachmentId;
      const blob = await tasksService.downloadAttachment(taskIdentifier, attachmentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    [taskIdentifier]
  );

  const handleDeleteTask = useCallback(async () => {
    const resultAction = await dispatch(deleteTaskThunk(taskIdentifier));
    if (deleteTaskThunk.fulfilled.match(resultAction)) {
      setIsDeleteModalOpen(false);
      onClose();
      onDeleted?.();
    }
  }, [dispatch, taskIdentifier, onClose, onDeleted]);

  const renderComments = () => {
    if (isCommentsLoading) {
      return (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      );
    }
    if (comments.length === 0) {
      return (
        <p className="text-xs text-slate-400 text-center py-6">
          {TASKS_CONSTANTS.detailDrawer.noComments}
        </p>
      );
    }
    return (
      <div className="space-y-3">
        {comments.map((comment) => {
          const author = resolveMember(comment.authorId);
          return (
            <div key={comment._id || comment.commentId} className="flex items-start gap-2.5">
              <Avatar firstName={author?.firstName} lastName={author?.lastName} size="sm" />
              <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {author ? memberLabel(author) : 'Unknown'}
                  </span>
                  <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAttachments = () => {
    if (isAttachmentsLoading) {
      return (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      );
    }
    if (attachments.length === 0) {
      return (
        <p className="text-xs text-slate-400 text-center py-6">
          {TASKS_CONSTANTS.detailDrawer.noAttachments}
        </p>
      );
    }
    return (
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <button
            key={attachment._id || attachment.attachmentId}
            type="button"
            onClick={() => handleDownloadAttachment(attachment)}
            className="w-full flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Image src="/icons/download.svg" alt="" width={14} height={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{attachment.filename}</p>
              <p className="text-[10px] text-slate-400">{formatBytes(attachment.size)}</p>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderActivity = () => {
    if (isActivityLoading) {
      return (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      );
    }
    if (activity.length === 0) {
      return (
        <p className="text-xs text-slate-400 text-center py-6">
          {TASKS_CONSTANTS.detailDrawer.noActivity}
        </p>
      );
    }
    return (
      <div className="space-y-3">
        {activity.map((entry) => (
          <div key={entry._id || entry.activityId} className="flex items-start gap-2.5">
            <span className="h-2 w-2 mt-1.5 rounded-full bg-blue-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-700">
                <span className="font-bold">{entry.actorName || 'System'}</span> {entry.message}
              </p>
              <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                {formatDate(entry.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!task) return null;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'details', label: TASKS_CONSTANTS.detailDrawer.tabs.details },
    {
      key: 'comments',
      label: `${TASKS_CONSTANTS.detailDrawer.tabs.comments} (${comments.length})`,
    },
    {
      key: 'attachments',
      label: `${TASKS_CONSTANTS.detailDrawer.tabs.attachments} (${attachments.length})`,
    },
    { key: 'activity', label: TASKS_CONSTANTS.detailDrawer.tabs.activity },
  ];

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} title={`${task.taskKey}: ${task.title}`} width="lg">
        <div className="space-y-5">
          <div className="flex items-center gap-1 border-b border-slate-200 -mt-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-5">
              {detailsError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 font-medium"
                >
                  {detailsError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">
                    {TASKS_CONSTANTS.detailDrawer.statusLabel}
                  </span>
                  <Select
                    value={task.status}
                    onChange={handleStatusChange}
                    options={statusOptions}
                  />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">
                    {TASKS_CONSTANTS.detailDrawer.priorityLabel}
                  </span>
                  <Select
                    value={task.priority}
                    onChange={handlePriorityChange}
                    options={TASK_PRIORITY_OPTIONS}
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1.5">
                  {TASKS_CONSTANTS.detailDrawer.assigneeLabel}
                </span>
                <Select
                  value={assignee?._id || ''}
                  onChange={handleAssigneeChange}
                  options={assigneeOptions}
                />
              </div>

              {reporter && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">
                    {TASKS_CONSTANTS.detailDrawer.reporterLabel}:
                  </span>
                  <Avatar firstName={reporter.firstName} lastName={reporter.lastName} size="xs" />
                  <span>{memberLabel(reporter)}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor={titleInputId}
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Title
                </label>
                <input
                  id={titleInputId}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor={descInputId}
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  {TASKS_CONSTANTS.detailDrawer.descriptionLabel}
                </label>
                <textarea
                  id={descInputId}
                  rows={4}
                  value={description}
                  placeholder={TASKS_CONSTANTS.detailDrawer.noDescription}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor={dueDateInputId}
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  {TASKS_CONSTANTS.detailDrawer.dueDateLabel}
                </label>
                <input
                  id={dueDateInputId}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {task.labels && task.labels.length > 0 && (
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">
                    {TASKS_CONSTANTS.detailDrawer.labelsLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map((label) => (
                      <span
                        key={label}
                        className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => setIsDeleteModalOpen(true)}
                  leftIcon={<Image src="/icons/trash.svg" alt="" width={14} height={14} />}
                >
                  {TASKS_CONSTANTS.detailDrawer.deleteButtonText}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveDetails}
                  isLoading={isSavingDetails}
                >
                  {TASKS_CONSTANTS.detailDrawer.saveButtonText}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <Avatar
                  firstName={currentUser?.firstName}
                  lastName={currentUser?.lastName}
                  size="sm"
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    placeholder={TASKS_CONSTANTS.detailDrawer.commentPlaceholder}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handlePostComment}
                      isLoading={isPostingComment}
                      disabled={!commentInput.trim()}
                    >
                      {TASKS_CONSTANTS.detailDrawer.postCommentButtonText}
                    </Button>
                  </div>
                </div>
              </div>

              {renderComments()}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div>
                <label htmlFor={fileInputId}>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 border-2 border-blue-600 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors">
                    <Image src="/icons/plus.svg" alt="" width={14} height={14} />
                    {isUploading
                      ? TASKS_CONSTANTS.detailDrawer.uploadingText
                      : TASKS_CONSTANTS.detailDrawer.uploadAttachmentButtonText}
                  </span>
                </label>
                <input
                  id={fileInputId}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {TASKS_CONSTANTS.detailDrawer.maxAttachmentSizeHint}
                </p>
              </div>

              {renderAttachments()}
            </div>
          )}

          {activeTab === 'activity' && <div className="space-y-4">{renderActivity()}</div>}
        </div>
      </Drawer>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTask}
        title={TASKS_CONSTANTS.deleteModal.title}
        message={TASKS_CONSTANTS.deleteModal.message(task.title)}
        confirmText={TASKS_CONSTANTS.deleteModal.confirmButtonText}
        isDestructive
      />
    </>
  );
});

TaskDetailDrawer.displayName = 'TaskDetailDrawer';
export default TaskDetailDrawer;
