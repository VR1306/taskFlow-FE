'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Image,
  Select,
  Avatar,
  Badge,
  EmptyState,
  Pagination,
  ConfirmationModal,
  Loader,
} from '@/components/ui';
import { CreateProjectDrawer, EditProjectDrawer, ProjectActionsMenu } from '@/components/projects';
import { useDebounce, usePermission } from '@/helpers';
import { PROJECTS_CONSTANTS, PROJECT_STATUS_OPTIONS } from '@/constants';
import {
  useAppDispatch,
  useAppSelector,
  fetchProjects,
  deleteProjectThunk,
  setProjectCurrentPage,
  setProjectLimit,
  setProjectSearch,
  setProjectStatusFilter,
} from '@/store';
import { Project } from '@/types';

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const canCreate = usePermission(['projects.create', '*']);
  const canEdit = usePermission(['projects.edit', '*']);
  const canDelete = usePermission(['projects.delete', '*']);

  const {
    cachedPages,
    currentPage,
    limit,
    search,
    filters,
    totalItems,
    totalPages,
    isLoading,
    isActionLoading,
  } = useAppSelector((state) => state.projects);

  const [searchInput, setSearchInput] = useState(search);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  const cacheKey = `${currentPage}-${limit}-${search}-${filters.status || ''}`;
  const projects = cachedPages?.[cacheKey]?.data || [];

  useEffect(() => {
    dispatch(setProjectSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(
      fetchProjects({
        page: currentPage,
        limit,
        search,
        status: filters.status,
      })
    );
  }, [dispatch, currentPage, limit, search, filters.status]);

  const handlePageChange = useCallback(
    (page: number) => dispatch(setProjectCurrentPage(page)),
    [dispatch]
  );
  const handleLimitChange = useCallback(
    (newLimit: number) => dispatch(setProjectLimit(newLimit)),
    [dispatch]
  );
  const handleStatusFilterChange = useCallback(
    (value: string) => dispatch(setProjectStatusFilter(value as 'active' | 'archived' | undefined)),
    [dispatch]
  );

  const handleRefresh = useCallback(() => {
    dispatch(
      fetchProjects({
        page: currentPage,
        limit,
        search,
        status: filters.status,
        forceRefresh: true,
      })
    );
  }, [dispatch, currentPage, limit, search, filters.status]);

  const handleOpenBoard = useCallback(
    (project: Project) => {
      // The board route always uses the Mongo ObjectId (not the human-readable
      // projectId) since Task.projectId references it directly and the board
      // endpoint requires a strict ObjectId.
      router.push(`/projects/${project.id || project._id}`);
    },
    [router]
  );

  const handleDeleteConfirm = useCallback(async () => {
    const identifier = deleteProject!.projectId || deleteProject!.id || '';
    setDeleteError(null);
    const resultAction = await dispatch(deleteProjectThunk(identifier));
    if (deleteProjectThunk.fulfilled.match(resultAction)) {
      setDeleteProject(null);
      handleRefresh();
    } else {
      setDeleteError(
        (resultAction.payload as string) || PROJECTS_CONSTANTS.deleteModal.defaultError
      );
    }
  }, [deleteProject, dispatch, handleRefresh]);

  const statusFilterValue = filters.status || 'all';

  const renderBoardContent = () => {
    if (isLoading && projects.length === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader />
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <EmptyState
          title={PROJECTS_CONSTANTS.emptyState.title}
          description={
            search || filters.status
              ? PROJECTS_CONSTANTS.emptyState.description
              : PROJECTS_CONSTANTS.emptyState.initialDescription
          }
          iconSrc="/icons/building.svg"
          action={
            canCreate && !search && !filters.status ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCreateDrawerOpen(true)}
                leftIcon={<Image src="/icons/plus-white.svg" alt="" width={15} height={15} />}
              >
                {PROJECTS_CONSTANTS.createButtonText}
              </Button>
            ) : undefined
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => {
          const lead = typeof project.leadId === 'object' && project.leadId ? project.leadId : null;
          return (
            <div
              key={project.projectId || project.id || project._id}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-4 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs">
                    {project.key}
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handleOpenBoard(project)}
                      className="text-left text-sm font-bold text-slate-900 truncate cursor-pointer after:absolute after:inset-0 after:content-['']"
                    >
                      {project.name}
                    </button>
                    <span className="text-[11px] font-mono text-slate-400">
                      {project.projectId}
                    </span>
                  </div>
                </div>
                <div className="relative z-10">
                  <ProjectActionsMenu
                    project={project}
                    onOpenBoard={handleOpenBoard}
                    onEdit={setEditProject}
                    onDelete={setDeleteProject}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                {project.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {lead ? (
                    <>
                      <Avatar firstName={lead.firstName} lastName={lead.lastName} size="xs" />
                      <span className="text-[11px] font-medium text-slate-600 truncate max-w-[100px]">
                        {`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Lead'}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      {PROJECTS_CONSTANTS.card.unassignedLead}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge size="sm" variant="default">
                    {project.memberCount ?? 0} members
                  </Badge>
                  <Badge size="sm" variant="primary">
                    {project.taskCount ?? 0} tasks
                  </Badge>
                  <Badge size="sm" variant={project.status === 'active' ? 'success' : 'default'}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {PROJECTS_CONSTANTS.pageTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{PROJECTS_CONSTANTS.pageSubtitle}</p>
        </div>

        {canCreate && (
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsCreateDrawerOpen(true)}
            leftIcon={<Image src="/icons/plus-white.svg" alt="" width={16} height={16} />}
          >
            {PROJECTS_CONSTANTS.createButtonText}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={PROJECTS_CONSTANTS.searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Image src="/icons/search.svg" alt="" width={14} height={14} className="opacity-50" />
          </div>
        </div>

        <div className="w-full sm:w-40">
          <Select
            value={statusFilterValue}
            onChange={handleStatusFilterChange}
            options={PROJECT_STATUS_OPTIONS}
          />
        </div>
      </div>

      {renderBoardContent()}

      {totalItems > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      )}

      <CreateProjectDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSuccess={handleRefresh}
      />

      <EditProjectDrawer
        isOpen={Boolean(editProject)}
        onClose={() => setEditProject(null)}
        project={editProject}
        onSuccess={handleRefresh}
      />

      <ConfirmationModal
        isOpen={Boolean(deleteProject)}
        onClose={() => {
          setDeleteProject(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={PROJECTS_CONSTANTS.deleteModal.title}
        message={deleteError || PROJECTS_CONSTANTS.deleteModal.message(deleteProject?.name || '')}
        confirmText={PROJECTS_CONSTANTS.deleteModal.confirmButtonText}
        isDestructive
        isLoading={isActionLoading}
      />
    </div>
  );
}
