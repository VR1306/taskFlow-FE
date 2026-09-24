import { SelectOption } from '@/components/ui/Select';

export type CreateUserRole = 'Project Manager' | 'Developer' | 'QA';
export type EditUserRole = 'Taskflow Admin' | 'Project Manager' | 'Developer' | 'QA';

export const CREATE_ROLE_OPTIONS: SelectOption<CreateUserRole>[] = [
  { value: 'Developer', label: 'Developer (Standard Workspace Access)' },
  { value: 'QA', label: 'QA (Quality & Verification Access)' },
  { value: 'Project Manager', label: 'Project Manager (Project & Team Lead Access)' },
];

export const STANDARD_ROLE_OPTIONS: SelectOption<EditUserRole>[] = [
  { value: 'Developer', label: 'Developer (Standard Workspace Access)' },
  { value: 'QA', label: 'QA (Quality & Verification Access)' },
  { value: 'Project Manager', label: 'Project Manager (Project & Team Lead Access)' },
];

export const TASKFLOW_ADMIN_ROLE_OPTIONS: SelectOption<'Taskflow Admin'>[] = [
  { value: 'Taskflow Admin', label: 'Taskflow Admin (Full Workspace Access)' },
];

export const STATUS_OPTIONS: SelectOption<boolean>[] = [
  { value: true, label: 'Active (Access Enabled)' },
  { value: false, label: 'Inactive (Access Suspended)' },
];

export const FILTER_ROLE_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'Taskflow Admin', label: 'Taskflow Admin' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Developer', label: 'Developer' },
  { value: 'QA', label: 'QA' },
];

export const FILTER_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: 'all', label: 'All Status' },
  { value: 'Active', label: 'Active (Full Access)' },
  { value: 'Inactive', label: 'Inactive (Suspended)' },
];

export const USERS_CONSTANTS = {
  // Page Header & Labels
  pageTitle: 'User Management',
  pageSubtitle: 'Manage team members, roles, and access permissions across your workspace.',
  createUserButtonText: 'Create User',
  filterButtonText: 'Filter',
  filterAriaLabel: 'Open user filter drawer',
  membersCardTitle: (count: number) => `All Members (${count})`,
  updatingText: 'Updating...',
  emptyMessage: 'No user records found.',
  searchPlaceholder: 'Search members by name, email, or user ID...',
  searchAriaLabel: 'Search team members',
  clearSearchAriaLabel: 'Clear search',
  noSearchResults: (query: string) => `No users matching "${query}" found.`,
  loadingText: 'Loading team members...',
  retryButtonText: 'Retry',

  // Filter Drawer
  filterDrawer: {
    title: 'Filter Team Members',
    description: 'Refine the member list by selecting specific roles and account statuses.',
    roleLabel: 'Assigned Role',
    rolePlaceholder: 'Select role...',
    statusLabel: 'Account Status',
    statusPlaceholder: 'Select status...',
    applyButtonText: 'Apply Filters',
    resetButtonText: 'Reset Filters',
  },

  // Active Filter Chips
  activeFilters: {
    rolePrefix: 'Role: ',
    statusPrefix: 'Status: ',
    clearAll: 'Clear all',
  },

  // Table Column Headers
  tableHeaders: {
    user: 'User',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    userId: 'User ID',
    actions: 'Actions',
  },

  // Actions Dropdown Menu
  actionsMenu: {
    viewDetails: 'View Details',
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    ariaLabel: (firstName: string, lastName: string) => `Actions for ${firstName} ${lastName}`,
  },

  // Create User Drawer
  createDrawer: {
    title: 'Create New User',
    description: 'Add a new member to your workspace. Fields are stacked sequentially below.',
    firstNameLabel: 'First Name',
    firstNamePlaceholder: 'e.g. Alexander',
    lastNameLabel: 'Last Name',
    lastNamePlaceholder: 'e.g. Wright',
    emailLabel: 'Work Email Address',
    emailPlaceholder: 'member@company.com',
    roleLabel: 'Role & Permissions',
    submitButtonText: 'Create User',
    cancelButtonText: 'Cancel',
    defaultError: 'Failed to create user account.',
  },

  // Edit User Drawer
  editDrawer: {
    title: 'Edit User Profile',
    description: 'Update team member details, role, and workspace access status.',
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name',
    emailLabel: 'Work Email Address',
    cannotBeModified: 'Cannot be modified',
    roleLabel: 'Role & Permissions',
    protectedRole: '(Protected)',
    statusLabel: 'Account Status',
    submitButtonText: 'Save Changes',
    cancelButtonText: 'Cancel',
    defaultError: 'Failed to update user profile.',
  },

  // View User Drawer
  viewDrawer: {
    title: 'User Profile Details',
    description: 'Complete workspace membership information and permission roles.',
    displayIdLabel: 'Display User ID',
    copyId: 'Copy ID',
    copied: 'Copied!',
    emailLabel: 'Work Email Address',
    roleLabel: 'Assigned Role',
    statusLabel: 'Account Status',
    activeStatus: 'Active (Full Access)',
    inactiveStatus: 'Inactive (Suspended)',
    joinedLabel: 'Member Joined',
    notAvailable: 'N/A',
    closeButtonText: 'Close',
    editButtonText: 'Edit Member',
  },

  // Delete Confirmation Modal
  deleteModal: {
    title: 'Delete User Account',
    message: (firstName: string, lastName: string, userId: string) =>
      `Are you sure you want to delete ${firstName} ${lastName} (${userId})?`,
    confirmButtonText: 'Delete User',
    cancelButtonText: 'Cancel',
  },

  // Validation Error Messages
  validation: {
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    roleRequired: 'Role is required',
  },
} as const;

export default USERS_CONSTANTS;
