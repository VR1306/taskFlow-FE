'use client';

import React, { memo } from 'react';
import { Avatar, Badge, EmptyState, Loader } from '@/components/ui';
import { ProjectActionsMenu } from './ProjectActionsMenu';
import { PROJECTS_CONSTANTS } from '@/constants';
import { Project } from '@/types';

export interface ProjectGridProps {
  projects: Project[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  onOpenBoard: (project: Project) => void;
  onEdit: (project: Project) => void;
  onArchiveToggle: (project: Project) => void;
  onDelete: (project: Project) => void;
  canEdit: boolean;
  canDelete: boolean;
  loadingText?: string;
  emptyIconSrc?: string;
}

/**
 * Shared card-grid renderer for a list of projects — used by both the active and
 * archived sections of the projects page so the card markup/behavior stays in sync.
 */
export const ProjectGrid = memo(function ProjectGrid({
  projects,
  isLoading,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onOpenBoard,
  onEdit,
  onArchiveToggle,
  onDelete,
  canEdit,
  canDelete,
  loadingText,
  emptyIconSrc,
}: ProjectGridProps) {
  if (isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200/80 min-h-[300px] animate-fadeIn transition-all">
        <Loader size="lg" text={loadingText} ariaLabel="Loading" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="animate-fadeIn">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          iconSrc={emptyIconSrc || '/icons/building.svg'}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
      {projects.map((project) => {
        const lead = typeof project.leadId === 'object' && project.leadId ? project.leadId : null;
        return (
          <div
            key={project?.projectId || project?.id || project?._id}
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
                    onClick={() => onOpenBoard(project)}
                    className="text-left text-sm font-bold text-slate-900 truncate cursor-pointer after:absolute after:inset-0 after:content-['']"
                  >
                    {project.name}
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">{project.projectId}</span>
                </div>
              </div>
              <div className="relative z-10">
                <ProjectActionsMenu
                  project={project}
                  onOpenBoard={onOpenBoard}
                  onEdit={onEdit}
                  onArchiveToggle={onArchiveToggle}
                  onDelete={onDelete}
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
});

ProjectGrid.displayName = 'ProjectGrid';
export default ProjectGrid;
