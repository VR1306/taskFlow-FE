'use client';

import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Badge } from '@/components/ui';
import { TASK_TYPE_BADGE_CLASSES, TASK_PRIORITY_BADGE_CLASSES } from '@/constants';
import { Task, ProjectMember } from '@/types';

export interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const resolveAssignee = (assigneeId?: ProjectMember | string | null): ProjectMember | null =>
  assigneeId && typeof assigneeId === 'object' ? assigneeId : null;

export const TaskCard = memo(function TaskCard({ task, onClick }: TaskCardProps) {
  const taskId = task._id || task.id || task.taskKey;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: taskId,
  });

  const assignee = resolveAssignee(task.assigneeId);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="w-full text-left block rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all duration-150 cursor-grab active:cursor-grabbing space-y-2.5"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold text-slate-400">{task.taskKey}</span>
        <Badge size="sm" className={TASK_TYPE_BADGE_CLASSES[task.type]}>
          {task.type}
        </Badge>
      </span>

      <span className="text-xs font-semibold text-slate-800 leading-snug line-clamp-3">
        {task.title}
      </span>

      {task.labels && task.labels.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
            >
              {label}
            </span>
          ))}
        </span>
      )}

      <span className="flex items-center justify-between pt-1">
        <Badge size="sm" className={TASK_PRIORITY_BADGE_CLASSES[task.priority]}>
          {task.priority}
        </Badge>
        {assignee ? (
          <Avatar firstName={assignee.firstName} lastName={assignee.lastName} size="xs" />
        ) : (
          <span className="h-6 w-6 rounded-full border border-dashed border-slate-300" />
        )}
      </span>
    </button>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;
