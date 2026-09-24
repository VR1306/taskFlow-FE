'use client';

import React, { memo, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useAppDispatch, moveTaskLocally, updateTaskStatusThunk } from '@/store';
import { TASK_STATUS_COLUMNS } from '@/constants';
import { KanbanColumn } from './KanbanColumn';
import { Task, TaskStatus } from '@/types';

export interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onMoveFailed?: () => void;
}

const taskIdentity = (task: Task) => task._id || task.id || task.taskKey;

export const computeInsertionOrder = (destinationTasks: Task[], insertIndex: number): number => {
  const prev = destinationTasks[insertIndex - 1];
  const next = destinationTasks[insertIndex];
  if (!prev && !next) return 0;
  if (!prev) return next.order - 1;
  if (!next) return prev.order + 1;
  return (prev.order + next.order) / 2;
};

export const KanbanBoard = memo(function KanbanBoard({
  tasks,
  onTaskClick,
  onMoveFailed,
}: KanbanBoardProps) {
  const dispatch = useAppDispatch();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      Todo: [],
      'In Progress': [],
      'In Review': [],
      Done: [],
    };
    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    }
    for (const status of TASK_STATUS_COLUMNS) {
      grouped[status].sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [tasks]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;

      const activeTask = tasks.find((t) => taskIdentity(t) === activeId);
      if (!activeTask) return;

      const isOverColumn = (TASK_STATUS_COLUMNS as string[]).includes(overId);
      const overTask = isOverColumn ? null : tasks.find((t) => taskIdentity(t) === overId);
      const targetStatus: TaskStatus = isOverColumn
        ? (overId as TaskStatus)
        : overTask?.status || activeTask.status;

      const destinationTasks = tasks
        .filter((t) => t.status === targetStatus && taskIdentity(t) !== activeId)
        .sort((a, b) => a.order - b.order);

      let insertIndex = destinationTasks.length;
      if (overTask) {
        // overTask always belongs to destinationTasks: targetStatus is derived from
        // overTask.status, and its id differs from activeId by construction above.
        insertIndex = destinationTasks.findIndex((t) => taskIdentity(t) === overId);
      }

      const newOrder = computeInsertionOrder(destinationTasks, insertIndex);

      if (targetStatus === activeTask.status && newOrder === activeTask.order) {
        return;
      }

      dispatch(moveTaskLocally({ taskId: activeId, status: targetStatus, order: newOrder }));
      dispatch(
        updateTaskStatusThunk({ id: activeId, data: { status: targetStatus, order: newOrder } })
      )
        .unwrap()
        .catch(() => {
          onMoveFailed?.();
        });
    },
    [tasks, dispatch, onMoveFailed]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-4">
        {TASK_STATUS_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DndContext>
  );
});

KanbanBoard.displayName = 'KanbanBoard';
export default KanbanBoard;
