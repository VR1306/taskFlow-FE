'use client';

import React, { memo, useMemo } from 'react';
import { ActionsMenu, ActionMenuItem } from '@/components/ui';
import { PROJECTS_CONSTANTS } from '@/constants';
import { Project } from '@/types';

export interface ProjectActionsMenuProps {
  project: Project;
  onOpenBoard: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ProjectActionsMenu = memo(function ProjectActionsMenu({
  project,
  onOpenBoard,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: ProjectActionsMenuProps) {
  const menuItems = useMemo<(ActionMenuItem | false | undefined)[]>(
    () => [
      {
        key: 'open-board',
        label: PROJECTS_CONSTANTS.actionsMenu.openBoard,
        icon: '/icons/dashboard.svg',
        onClick: () => onOpenBoard(project),
      },
      canEdit && {
        key: 'edit',
        label: PROJECTS_CONSTANTS.actionsMenu.editProject,
        icon: '/icons/edit.svg',
        onClick: () => onEdit(project),
      },
      canDelete && {
        key: 'delete',
        label: PROJECTS_CONSTANTS.actionsMenu.deleteProject,
        icon: '/icons/trash.svg',
        variant: 'danger',
        hasDividerBefore: true,
        onClick: () => onDelete(project),
      },
    ],
    [project, onOpenBoard, onEdit, onDelete, canEdit, canDelete]
  );

  return (
    <ActionsMenu
      ariaLabel={`Actions for ${project.name}`}
      items={menuItems}
      menuTestId={`project-actions-${project.projectId || project.id || project._id}`}
    />
  );
});

ProjectActionsMenu.displayName = 'ProjectActionsMenu';
export default ProjectActionsMenu;
