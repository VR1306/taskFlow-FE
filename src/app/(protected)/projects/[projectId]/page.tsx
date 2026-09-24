'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Image, Loader, Badge, EmptyState } from '@/components/ui';
import {
  KanbanBoard,
  CreateTaskDrawer,
  TaskDetailDrawer,
  TaskFilterDrawer,
  TaskFiltersState,
} from '@/components/tasks';
import { useAppDispatch, useAppSelector, fetchBoardTasks, resetBoard } from '@/store';
import { projectsService } from '@/services';
import { usePermission } from '@/helpers';
import { TASKS_CONSTANTS } from '@/constants';
import { Project, ProjectMember, Task } from '@/types';

const BOARD_POLL_INTERVAL_MS = 10000;

const DEFAULT_FILTERS: TaskFiltersState = { assigneeId: 'all', priority: 'all', type: 'all' };

export default function ProjectBoardPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const canCreateTask = usePermission(['tasks.create', '*']);

  const { tasks, isBoardLoading, error } = useAppSelector((state) => state.tasks);

  const [project, setProject] = useState<Project | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS);

  const projectId = params?.projectId as string;

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    projectsService
      .getProjectById(projectId)
      .then((res) => {
        if (!cancelled) setProject(res.data);
      })
      .catch(() => {
        if (!cancelled) setProject(null);
      })
      .finally(() => {
        if (!cancelled) setIsProjectLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return undefined;
    dispatch(fetchBoardTasks({ projectId }));

    const interval = setInterval(() => {
      dispatch(fetchBoardTasks({ projectId, silent: true }));
    }, BOARD_POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      dispatch(resetBoard());
    };
  }, [projectId, dispatch]);

  const members = useMemo<ProjectMember[]>(
    () => (project?.members || []).filter((m): m is ProjectMember => typeof m === 'object'),
    [project]
  );

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchInput.trim()) {
      const q = searchInput.trim().toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.taskKey.toLowerCase().includes(q)
      );
    }

    if (appliedFilters.assigneeId !== 'all') {
      result = result.filter((t) => {
        const assignee = t.assigneeId;
        const assigneeId =
          typeof assignee === 'object' && assignee ? assignee._id || assignee.id : assignee;
        if (appliedFilters.assigneeId === 'unassigned') return !assigneeId;
        return assigneeId === appliedFilters.assigneeId;
      });
    }

    if (appliedFilters.priority !== 'all') {
      result = result.filter((t) => t.priority === appliedFilters.priority);
    }

    if (appliedFilters.type !== 'all') {
      result = result.filter((t) => t.type === appliedFilters.type);
    }

    return result;
  }, [tasks, searchInput, appliedFilters]);

  const handleMoveFailed = useCallback(() => {
    dispatch(fetchBoardTasks({ projectId }));
  }, [dispatch, projectId]);

  const handleOpenFilterDrawer = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterDrawerOpen(true);
  }, [appliedFilters]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setIsFilterDrawerOpen(false);
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setIsFilterDrawerOpen(false);
  }, []);

  const activeFilterCount = [
    appliedFilters.assigneeId,
    appliedFilters.priority,
    appliedFilters.type,
  ].filter((v) => v !== 'all').length;

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="This project may have been deleted or you don't have access to it."
        iconSrc="/icons/building.svg"
        actionText={TASKS_CONSTANTS.backToProjectsText}
        onAction={() => router.push('/projects')}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <Image src="/icons/chevron-left.svg" alt="" width={12} height={12} />
          {TASKS_CONSTANTS.backToProjectsText}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs">
              {project.key}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">{project.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredTasks.length} tasks on the board
              </p>
            </div>
            <Badge size="sm" variant={project.status === 'active' ? 'success' : 'default'}>
              {project.status}
            </Badge>
          </div>

          {canCreateTask && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsCreateDrawerOpen(true)}
              leftIcon={<Image src="/icons/plus-white.svg" alt="" width={15} height={15} />}
            >
              {TASKS_CONSTANTS.createTaskButtonText}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={TASKS_CONSTANTS.boardSearchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Image src="/icons/search.svg" alt="" width={14} height={14} className="opacity-50" />
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={handleOpenFilterDrawer}>
          {TASKS_CONSTANTS.filterButtonText}
          {activeFilterCount > 0 && (
            <Badge size="sm" variant="primary" className="ml-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 font-medium"
        >
          {error}
        </div>
      )}

      {isBoardLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader />
          <span className="ml-2 text-xs text-slate-500">{TASKS_CONSTANTS.loadingBoardText}</span>
        </div>
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskClick={setSelectedTask}
          onMoveFailed={handleMoveFailed}
        />
      )}

      <CreateTaskDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        projectId={project.id || project._id || projectId}
        members={members}
      />

      <TaskDetailDrawer
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        members={members}
      />

      <TaskFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        members={members}
      />
    </div>
  );
}
