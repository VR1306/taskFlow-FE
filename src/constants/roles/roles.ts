export const ROLES_CONSTANTS = {
  pageTitle: 'Role Management',
  pageSubtitle:
    'Define organizational roles, configure granular permissions, and govern user access levels.',
  createButtonText: 'Create Role',
  searchPlaceholder: 'Search by role name, description, role ID...',
  rolesCardTitle: (count: number) => `All Roles (${count})`,
  emptyStateTitle: 'No Roles Found',
  emptyStateDescription: 'No roles match your current search and filter criteria.',
  unauthorizedTitle: 'Access Denied',
  unauthorizedDescription:
    'You do not have permission to view or manage organizational roles. Please contact a workspace administrator.',

  roleTypeOptions: [
    { value: 'Taskflow Admin', label: 'Taskflow Admin' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Developer', label: 'Developer' },
    { value: 'QA', label: 'QA' },
    { value: 'Custom', label: 'Custom' },
  ],

  statusOptions: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],

  createDrawer: {
    title: 'Create New Role',
    description: 'Configure a new organizational role with customizable permission matrices.',
    nameLabel: 'Role Name',
    namePlaceholder: 'e.g., Senior Project Manager',
    descLabel: 'Role Description',
    descPlaceholder: 'Briefly describe the responsibilities and scope of this role...',
    typeLabel: 'Role Type',
    typePlaceholder: 'Select role category',
    statusLabel: 'Active Status',
    statusDescription: 'Enable this role for user assignment',
    permissionsLabel: 'Role Permissions Matrix',
    permissionsDescription: 'Grant specific functional capabilities across workspace modules.',
    submitButtonText: 'Create Role',
    submittingButtonText: 'Creating...',
    cancelButtonText: 'Cancel',
    defaultError: 'Failed to create role. Please verify your inputs and try again.',
  },

  editDrawer: {
    title: 'Edit Role',
    description: 'Update role details, access classification, and assigned permissions.',
    submitButtonText: 'Save Changes',
    submittingButtonText: 'Saving...',
    cancelButtonText: 'Cancel',
    defaultError: 'Failed to update role. Please try again.',
  },

  viewDrawer: {
    title: 'Role Details',
    description: 'Complete specification and granted permissions for this role.',
    closeButtonText: 'Close',
    editButtonText: 'Edit Role',
    systemBadgeText: 'System Protected Role',
  },

  filterDrawer: {
    title: 'Filter Roles',
    description: 'Filter roles list by access classification and status.',
    roleTypeLabel: 'Role Type',
    roleTypePlaceholder: 'All Role Types',
    statusLabel: 'Role Status',
    statusPlaceholder: 'All Status',
    applyButtonText: 'Apply Filters',
    resetButtonText: 'Reset Filters',
  },

  deleteModal: {
    title: 'Delete Role',
    message:
      'Are you sure you want to permanently delete this role? Users assigned to this role must be reassigned first.',
    confirmText: 'Delete Role',
    cancelText: 'Keep Role',
    defaultError: 'Failed to delete role. Please ensure no active users are assigned.',
  },
} as const;

export default ROLES_CONSTANTS;
