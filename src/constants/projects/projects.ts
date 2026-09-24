import { SelectOption } from '@/components/ui/Select';

export const PROJECT_STATUS_FORM_OPTIONS: SelectOption<'active' | 'archived'>[] = [
  { value: 'active', label: 'Active (Operational)' },
  { value: 'archived', label: 'Archived (Read-only)' },
];

export const PROJECTS_CONSTANTS = {
  pageTitle: 'Projects',
  pageSubtitle: 'Organize work into projects, assign leads, and manage team membership.',
  createButtonText: 'Create Project',
  searchPlaceholder: 'Search projects by name, key, or description...',

  emptyState: {
    title: 'No Projects Found',
    description: 'No projects match your current search or filter criteria.',
    initialDescription: 'Start by creating your first project to organize team work.',
  },

  archivedSection: {
    title: 'Archived Projects',
    showButtonText: (count: number) => `Show Archived Projects (${count})`,
    hideButtonText: 'Hide Archived Projects',
    emptyTitle: 'No Archived Projects',
    emptyDescription: 'Projects you archive will show up here, out of the active list.',
    searchEmptyDescription: 'No archived projects match your current search.',
  },

  card: {
    membersLabel: 'Members',
    tasksLabel: 'Tasks',
    leadLabel: 'Lead',
    unassignedLead: 'No lead assigned',
    openBoardButtonText: 'Open Board',
  },

  actionsMenu: {
    openBoard: 'Open Board',
    editProject: 'Edit Project',
    archiveProject: 'Archive Project',
    restoreProject: 'Restore Project',
    deleteProject: 'Delete Project',
  },

  createDrawer: {
    title: 'Create New Project',
    description: 'Set up a new project workspace and assign an initial team.',
    nameLabel: 'Project Name',
    namePlaceholder: 'e.g. Customer Portal Revamp',
    keyLabel: 'Project Key',
    keyPlaceholder: 'Auto-generated if left blank',
    keyHint: 'Used as the prefix for task IDs, e.g. ENG-1, ENG-2.',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Briefly describe the goal of this project...',
    leadLabel: 'Project Lead',
    membersLabel: 'Team Members',
    submitButtonText: 'Create Project',
    submittingButtonText: 'Creating...',
    cancelButtonText: 'Cancel',
    defaultError: 'Failed to create project. Please try again.',
  },

  editDrawer: {
    title: 'Edit Project',
    description: 'Update project details, lead, membership, and status.',
    statusLabel: 'Status',
    submitButtonText: 'Save Changes',
    submittingButtonText: 'Saving...',
    cancelButtonText: 'Cancel',
    defaultError: 'Failed to update project. Please try again.',
  },

  deleteModal: {
    title: 'Delete Project',
    message: (name: string) =>
      `Are you sure you want to permanently delete "${name}"? This will also delete all of its tasks and cannot be undone. If you want to keep the project's data but hide it from the active list, archive it instead.`,
    confirmButtonText: 'Delete Permanently',
    defaultError: 'Failed to delete project.',
  },

  archiveModal: {
    title: 'Archive Project',
    message: (name: string) =>
      `Archive "${name}"? It will be hidden from the active projects list but its data and tasks are kept, and you can restore it any time.`,
    confirmButtonText: 'Archive Project',
    defaultError: 'Failed to archive project.',
  },

  restoreModal: {
    title: 'Restore Project',
    message: (name: string) => `Restore "${name}" back to the active projects list?`,
    confirmButtonText: 'Restore Project',
    defaultError: 'Failed to restore project.',
  },
} as const;

export default PROJECTS_CONSTANTS;
