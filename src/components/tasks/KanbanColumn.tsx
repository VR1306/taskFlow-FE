'use client';

import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TASK_STATUS_COLUMN_STYLES, TASKS_CONSTANTS } from '@/constants';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types';

export interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const taskIdentity = (task: Task) => task._id || task.id || task.taskKey;

export const KanbanColumn = memo(function KanbanColumn({
  status,
  tasks,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const styles = TASK_STATUS_COLUMN_STYLES[status];
  const taskIds = tasks.map(taskIdentity);

  return (
    <div className="flex flex-col w-full sm:w-72 shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
        <h3 className={`text-xs font-bold uppercase tracking-wide ${styles.header}`}>{status}</h3>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[120px] rounded-2xl border-2 border-dashed p-2 space-y-2.5 transition-colors duration-150 ${
          isOver ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200/70 bg-slate-50/60'
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-6">
              {TASKS_CONSTANTS.emptyColumnText}
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={taskIdentity(task)} task={task} onClick={onTaskClick} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';
export default KanbanColumn;
