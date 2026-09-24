'use client';

import React, { memo, useState, useCallback, useId } from 'react';
import { Drawer, Select, Button, Image } from '@/components/ui';
import { useAppDispatch, createTaskThunk } from '@/store';
import { TASKS_CONSTANTS, TASK_TYPE_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/constants';
import { ProjectMember, TaskType, TaskPriority } from '@/types';

export interface CreateTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
  onSuccess?: () => void;
}

export const CreateTaskDrawer = memo(function CreateTaskDrawer({
  isOpen,
  onClose,
  projectId,
  members,
  onSuccess,
}: CreateTaskDrawerProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Task');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const titleInputId = useId();
  const descInputId = useId();
  const typeSelectId = useId();
  const prioritySelectId = useId();
  const assigneeSelectId = useId();
  const dueDateInputId = useId();
  const labelsInputId = useId();

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setType('Task');
    setPriority('Medium');
    setAssigneeId('');
    setDueDate('');
    setLabelInput('');
    setLabels([]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const assigneeOptions = [
    { value: '', label: TASKS_CONSTANTS.createDrawer.unassignedOption },
    ...members.map((m) => {
      const id = m._id || m.id || '';
      const label = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Unnamed';
      return { value: id, label };
    }),
  ];

  const handleLabelKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && labelInput.trim()) {
        e.preventDefault();
        if (!labels.includes(labelInput.trim())) {
          setLabels((prev) => [...prev, labelInput.trim()]);
        }
        setLabelInput('');
      }
    },
    [labelInput, labels]
  );

  const removeLabel = useCallback((label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.SyntheticEvent) => {
      e?.preventDefault();
      if (!title.trim()) {
        setError('Task title is required');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const resultAction = await dispatch(
          createTaskThunk({
            projectId,
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            priority,
            assigneeId: assigneeId || null,
            dueDate: dueDate || null,
            labels,
          })
        );

        if (createTaskThunk.fulfilled.match(resultAction)) {
          handleClose();
          onSuccess?.();
        } else {
          setError((resultAction.payload as string) || TASKS_CONSTANTS.createDrawer.defaultError);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      dispatch,
      projectId,
      title,
      description,
      type,
      priority,
      assigneeId,
      dueDate,
      labels,
      handleClose,
      onSuccess,
    ]
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={TASKS_CONSTANTS.createDrawer.title}
      description={TASKS_CONSTANTS.createDrawer.description}
      width="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {TASKS_CONSTANTS.createDrawer.cancelButtonText}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Image src="/icons/plus-white.svg" alt="" width={16} height={16} />}
          >
            {TASKS_CONSTANTS.createDrawer.submitButtonText}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 font-medium"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor={titleInputId} className="block text-xs font-bold text-slate-700 mb-1.5">
            {TASKS_CONSTANTS.createDrawer.titleLabel} <span className="text-rose-500">*</span>
          </label>
          <input
            id={titleInputId}
            placeholder={TASKS_CONSTANTS.createDrawer.titlePlaceholder}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setError(null);
            }}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
          />
        </div>

        <div>
          <label htmlFor={descInputId} className="block text-xs font-bold text-slate-700 mb-1.5">
            {TASKS_CONSTANTS.createDrawer.descriptionLabel}
          </label>
          <textarea
            id={descInputId}
            rows={3}
            placeholder={TASKS_CONSTANTS.createDrawer.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={typeSelectId} className="block text-xs font-bold text-slate-700 mb-1.5">
              {TASKS_CONSTANTS.createDrawer.typeLabel}
            </label>
            <Select
              id={typeSelectId}
              value={type}
              onChange={(val) => setType(val as TaskType)}
              isDisabled={isSubmitting}
              options={TASK_TYPE_OPTIONS}
            />
          </div>
          <div>
            <label
              htmlFor={prioritySelectId}
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              {TASKS_CONSTANTS.createDrawer.priorityLabel}
            </label>
            <Select
              id={prioritySelectId}
              value={priority}
              onChange={(val) => setPriority(val as TaskPriority)}
              isDisabled={isSubmitting}
              options={TASK_PRIORITY_OPTIONS}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={assigneeSelectId}
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            {TASKS_CONSTANTS.createDrawer.assigneeLabel}
          </label>
          <Select
            id={assigneeSelectId}
            value={assigneeId}
            onChange={setAssigneeId}
            isDisabled={isSubmitting}
            options={assigneeOptions}
          />
        </div>

        <div>
          <label htmlFor={dueDateInputId} className="block text-xs font-bold text-slate-700 mb-1.5">
            {TASKS_CONSTANTS.createDrawer.dueDateLabel}
          </label>
          <input
            id={dueDateInputId}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
          />
        </div>

        <div>
          <label htmlFor={labelsInputId} className="block text-xs font-bold text-slate-700 mb-1.5">
            {TASKS_CONSTANTS.createDrawer.labelsLabel}
          </label>
          <input
            id={labelsInputId}
            placeholder={TASKS_CONSTANTS.createDrawer.labelsPlaceholder}
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={handleLabelKeyDown}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
          />
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={`Remove label ${label}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
});

CreateTaskDrawer.displayName = 'CreateTaskDrawer';
export default CreateTaskDrawer;
