'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Image,
  Pagination,
  ConfirmationModal,
  Tabs,
  TabPanel,
  TabItem,
} from '@/components/ui';
import { CreateProjectDrawer, EditProjectDrawer, ProjectGrid } from '@/components/projects';
import { useDebounce, usePermission } from '@/helpers';
import { PROJECTS_CONSTANTS } from '@/constants';
import {
  useAppDispatch,
  useAppSelector,
  fetchProjects,
  fetchArchivedProjects,
  updateProjectThunk,
  deleteProjectThunk,
  setProjectCurrentPage,
  setProjectLimit,
  setProjectSearch,
  setArchivedProjectCurrentPage,
  setArchivedProjectLimit,
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
    totalItems,
    totalPages,
    isLoading,
    isActionLoading,
    archivedItems,
    archivedTotalItems,
    archivedTotalPages,
    archivedCurrentPage,
    archivedLimit,
    isArchivedLoading,
  } = useAppSelector((state) => state.projects);

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');

  const handleTabChange = useCallback(
    (newTab: 'active' | 'archived') => {
      if (newTab === activeTab) return;
      setTransitionDirection(newTab === 'archived' ? 'right' : 'left');
      setActiveTab(newTab);
    },
    [activeTab]
  );

  const [searchInput, setSearchInput] = useState(search);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveToggleProject, setArchiveToggleProject] = useState<Project | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const tabItems: TabItem<'active' | 'archived'>[] = useMemo(
    () => [
      {
        key: 'active',
        label: (
          <span>
            Active<span className="hidden min-[400px]:inline"> Projects</span>
          </span>
        ),
        badge: totalItems,
        icon: <Image src="/icons/building.svg" alt="" width={15} height={15} />,
      },
      {
        key: 'archived',
        label: (
          <span>
            Archived<span className="hidden min-[400px]:inline"> Projects</span>
          </span>
        ),
        badge: archivedTotalItems,
        icon: <Image src="/icons/download.svg" alt="" width={15} height={15} />,
      },
    ],
    [totalItems, archivedTotalItems]
  );

  const debouncedSearch = useDebounce(searchInput, 400);
  const cacheKey = `${currentPage}-${limit}-${search}-active`;
  const projects = cachedPages?.[cacheKey]?.data || [];

  useEffect(() => {
    dispatch(setProjectSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // The main section only ever shows active projects — archived ones live in their own
  // section below, fetched separately.
  useEffect(() => {
    dispatch(
      fetchProjects({
        page: currentPage,
        limit,
        search,
        status: 'active',
      })
    );
  }, [dispatch, currentPage, limit, search]);

  // Fetched eagerly (same as the active list) so the toggle button below can show an
  // accurate count even before the section is expanded — only its visibility is deferred.
  useEffect(() => {
    dispatch(
      fetchArchivedProjects({
        page: archivedCurrentPage,
        limit: archivedLimit,
        search,
      })
    );
  }, [dispatch, archivedCurrentPage, archivedLimit, search]);

  const handlePageChange = useCallback(
    (page: number) => dispatch(setProjectCurrentPage(page)),
    [dispatch]
  );
  const handleLimitChange = useCallback(
    (newLimit: number) => dispatch(setProjectLimit(newLimit)),
    [dispatch]
  );
  const handleArchivedPageChange = useCallback(
    (page: number) => dispatch(setArchivedProjectCurrentPage(page)),
    [dispatch]
  );
  const handleArchivedLimitChange = useCallback(
    (newLimit: number) => dispatch(setArchivedProjectLimit(newLimit)),
    [dispatch]
  );

  const handleRefresh = useCallback(() => {
    dispatch(
      fetchProjects({
        page: currentPage,
        limit,
        search,
        status: 'active',
        forceRefresh: true,
      })
    );
    // A create/edit/archive/restore/delete can move a project into or out of the
    // archived section too, so refresh it alongside the active list.
    dispatch(
      fetchArchivedProjects({
        page: archivedCurrentPage,
        limit: archivedLimit,
        search,
        forceRefresh: true,
      })
    );
  }, [dispatch, currentPage, limit, search, archivedCurrentPage, archivedLimit]);

  const handleOpenBoard = useCallback(
    (project: Project) => {
      // The board route always uses the Mongo ObjectId (not the human-readable
      // projectId) since Task.projectId references it directly and the board
      // endpoint requires a strict ObjectId.
      router.push(`/projects/${project?.id || project?._id}`);
    },
    [router]
  );

  const handleDeleteConfirm = useCallback(async () => {
    const identifier = deleteProject?.projectId || deleteProject?.id || '';
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

  const isRestoring = archiveToggleProject?.status === 'archived';
  const toggleProjectName = archiveToggleProject?.name || '';
  const archiveModalMessage =
    archiveError ||
    (isRestoring
      ? PROJECTS_CONSTANTS.restoreModal.message(toggleProjectName)
      : PROJECTS_CONSTANTS.archiveModal.message(toggleProjectName));

  const handleArchiveToggleConfirm = useCallback(async () => {
    const identifier = archiveToggleProject?.projectId || archiveToggleProject?.id || '';
    const targetStatus = archiveToggleProject?.status === 'archived' ? 'active' : 'archived';
    setArchiveError(null);
    const resultAction = await dispatch(
      updateProjectThunk({ id: identifier, data: { status: targetStatus } })
    );
    if (updateProjectThunk.fulfilled.match(resultAction)) {
      setArchiveToggleProject(null);
      handleRefresh();
    } else {
      const defaultError =
        targetStatus === 'archived'
          ? PROJECTS_CONSTANTS.archiveModal.defaultError
          : PROJECTS_CONSTANTS.restoreModal.defaultError;
      setArchiveError((resultAction.payload as string) || defaultError);
    }
  }, [archiveToggleProject, dispatch, handleRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {PROJECTS_CONSTANTS.pageTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{PROJECTS_CONSTANTS.pageSubtitle}</p>
        </div>

        {canCreate && (
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsCreateDrawerOpen(true)}
            className="w-full sm:w-auto justify-center"
            leftIcon={<Image src="/icons/plus-white.svg" alt="" width={16} height={16} />}
          >
            {PROJECTS_CONSTANTS.createButtonText}
          </Button>
        )}
      </div>

      {/* Navigation Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="w-full sm:w-auto">
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={(key) => handleTabChange(key as 'active' | 'archived')}
            variant="segmented"
            ariaLabel="Project filter tabs"
            className="w-full sm:w-auto"
          />
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={
              activeTab === 'active'
                ? PROJECTS_CONSTANTS.searchPlaceholder
                : 'Search archived projects...'
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Image src="/icons/search.svg" alt="" width={14} height={14} className="opacity-50" />
          </div>
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <Image src="/icons/close.svg" alt="" width={12} height={12} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-clip">
        {/* Active Projects Tab Panel */}
        <TabPanel
          tabKey="active"
          activeKey={activeTab}
          direction={transitionDirection}
          className="space-y-6"
        >
          <ProjectGrid
            projects={projects}
            isLoading={isLoading}
            loadingText="Loading active projects..."
            emptyTitle={PROJECTS_CONSTANTS.emptyState.title}
            emptyDescription={
              search
                ? PROJECTS_CONSTANTS.emptyState.description
                : PROJECTS_CONSTANTS.emptyState.initialDescription
            }
            emptyAction={
              canCreate && !search ? (
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
            onOpenBoard={handleOpenBoard}
            onEdit={setEditProject}
            onArchiveToggle={setArchiveToggleProject}
            onDelete={setDeleteProject}
            canEdit={canEdit}
            canDelete={canDelete}
          />

          {totalItems > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4">
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
        </TabPanel>

        {/* Archived Projects Tab Panel */}
        <TabPanel
          tabKey="archived"
          activeKey={activeTab}
          direction={transitionDirection}
          className="space-y-6"
        >
          <ProjectGrid
            projects={archivedItems}
            isLoading={isArchivedLoading}
            loadingText="Loading archived projects..."
            emptyTitle={PROJECTS_CONSTANTS.archivedSection.emptyTitle}
            emptyDescription={
              search
                ? PROJECTS_CONSTANTS.archivedSection.searchEmptyDescription
                : PROJECTS_CONSTANTS.archivedSection.emptyDescription
            }
            emptyAction={
              !search ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange('active')}
                  leftIcon={<Image src="/icons/building.svg" alt="" width={14} height={14} />}
                >
                  View Active Projects
                </Button>
              ) : undefined
            }
            onOpenBoard={handleOpenBoard}
            onEdit={setEditProject}
            onArchiveToggle={setArchiveToggleProject}
            onDelete={setDeleteProject}
            canEdit={canEdit}
            canDelete={canDelete}
          />

          {archivedTotalItems > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4">
              <Pagination
                currentPage={archivedCurrentPage}
                totalPages={archivedTotalPages}
                totalItems={archivedTotalItems}
                limit={archivedLimit}
                onPageChange={handleArchivedPageChange}
                onLimitChange={handleArchivedLimitChange}
              />
            </div>
          )}
        </TabPanel>
      </div>

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

      <ConfirmationModal
        isOpen={Boolean(archiveToggleProject)}
        onClose={() => {
          setArchiveToggleProject(null);
          setArchiveError(null);
        }}
        onConfirm={handleArchiveToggleConfirm}
        title={
          isRestoring
            ? PROJECTS_CONSTANTS.restoreModal.title
            : PROJECTS_CONSTANTS.archiveModal.title
        }
        message={archiveModalMessage}
        confirmText={
          isRestoring
            ? PROJECTS_CONSTANTS.restoreModal.confirmButtonText
            : PROJECTS_CONSTANTS.archiveModal.confirmButtonText
        }
        isLoading={isActionLoading}
      />
    </div>
  );
}
