import { SelectOption } from '@/components/ui/Select';

export const PROJECT_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

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
      `Are you sure you want to delete "${name}"? This cannot be undone once all its tasks are removed.`,
    confirmButtonText: 'Delete Project',
    defaultError: 'Failed to delete project. Please ensure it has no active tasks.',
  },
} as const;

export default PROJECTS_CONSTANTS;
