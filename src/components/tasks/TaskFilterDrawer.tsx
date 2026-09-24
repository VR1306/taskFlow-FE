'use client';

import React, { memo, useId } from 'react';
import { FilterDrawer, Select } from '@/components/ui';
import {
  TASKS_CONSTANTS,
  TASK_PRIORITY_FILTER_OPTIONS,
  TASK_TYPE_FILTER_OPTIONS,
} from '@/constants';
import { ProjectMember } from '@/types';

export interface TaskFiltersState {
  assigneeId: string;
  priority: string;
  type: string;
}

export interface TaskFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
  members: ProjectMember[];
}

export const TaskFilterDrawer = memo(function TaskFilterDrawer({
  isOpen,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  members,
}: TaskFilterDrawerProps) {
  const assigneeSelectId = useId();
  const prioritySelectId = useId();
  const typeSelectId = useId();

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...members.map((m) => {
      const id = m._id || m.id || '';
      const label = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Unnamed';
      return { value: id, label };
    }),
  ];

  const activeFilterCount = [filters.assigneeId, filters.priority, filters.type].filter(
    (v) => v && v !== 'all'
  ).length;

  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      onApply={onApply}
      onReset={onReset}
      title={TASKS_CONSTANTS.filterDrawer.title}
      description={TASKS_CONSTANTS.filterDrawer.description}
      activeFilterCount={activeFilterCount}
      applyButtonText={TASKS_CONSTANTS.filterDrawer.applyButtonText}
      resetButtonText={TASKS_CONSTANTS.filterDrawer.resetButtonText}
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor={assigneeSelectId}
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            {TASKS_CONSTANTS.filterDrawer.assigneeLabel}
          </label>
          <Select
            id={assigneeSelectId}
            value={filters.assigneeId}
            onChange={(value) => onChange({ ...filters, assigneeId: value })}
            options={assigneeOptions}
          />
        </div>

        <div>
          <label
            htmlFor={prioritySelectId}
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            {TASKS_CONSTANTS.filterDrawer.priorityLabel}
          </label>
          <Select
            id={prioritySelectId}
            value={filters.priority}
            onChange={(value) => onChange({ ...filters, priority: value })}
            options={TASK_PRIORITY_FILTER_OPTIONS}
          />
        </div>

        <div>
          <label htmlFor={typeSelectId} className="block text-xs font-bold text-slate-700 mb-1.5">
            {TASKS_CONSTANTS.filterDrawer.typeLabel}
          </label>
          <Select
            id={typeSelectId}
            value={filters.type}
            onChange={(value) => onChange({ ...filters, type: value })}
            options={TASK_TYPE_FILTER_OPTIONS}
          />
        </div>
      </div>
    </FilterDrawer>
  );
});

TaskFilterDrawer.displayName = 'TaskFilterDrawer';
export default TaskFilterDrawer;
