import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectsPage from './page';
import { apiClient } from '@/services/api';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import projectsReducer from '@/store/slices/projectsSlice';

jest.mock('@/services/api');

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/projects',
}));

const createMockStore = () =>
  configureStore({
    reducer: { auth: authReducer, ui: uiReducer, projects: projectsReducer },
    preloadedState: {
      auth: {
        user: {
          id: 'admin-1',
          firstName: 'Taskflow',
          lastName: 'Admin',
          email: 'admin@taskflow.dev',
          role: 'Taskflow Admin',
          permissions: ['*'],
        },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    },
  });

describe('ProjectsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    localStorage.clear();
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({ role: 'Taskflow Admin', permissions: ['*'] })
    );
  });

  it('renders project cards with member and task counts', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'proj-1',
          projectId: 'PRJ0001',
          key: 'ENG',
          name: 'Engineering',
          description: 'Core platform team',
          status: 'active',
          memberCount: 3,
          taskCount: 8,
          leadId: { _id: 'lead-1', firstName: 'Jane', lastName: 'Doe' },
        },
      ],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    expect(screen.getByText('3 members')).toBeInTheDocument();
    expect(screen.getByText('8 tasks')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Engineering' }));
    expect(mockPush).toHaveBeenCalledWith('/projects/proj-1');
  });

  it('displays the empty state when there are no projects', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Projects Found')).toBeInTheDocument();
    });
  });

  it('opens the create project drawer when the button is clicked and can be closed or reopened from empty state', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /create project/i })).toHaveLength(2);
    });

    // Search input typing
    const searchInput = screen.getByPlaceholderText(
      'Search projects by name, key, or description...'
    );
    fireEvent.change(searchInput, { target: { value: 'Frontend' } });
    expect(searchInput).toHaveValue('Frontend');

    // Header create button opens drawer
    fireEvent.click(screen.getAllByRole('button', { name: /create project/i })[0]);
    expect(screen.getByText('Create New Project')).toBeInTheDocument();

    // Cancel closes drawer
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
    });

    // Empty state create button opens drawer
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /create project/i })).toHaveLength(2);
    });
    fireEvent.click(screen.getAllByRole('button', { name: /create project/i })[1]);
    expect(await screen.findByText('Create New Project')).toBeInTheDocument();
  });

  it('shows the filtered empty state message once a status filter is applied', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Start by creating your first project to organize team work.')
      ).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByText('All Status'));
    fireEvent.click(screen.getByText('Active'));

    await waitFor(() => {
      expect(
        screen.getByText('No projects match your current search or filter criteria.')
      ).toBeInTheDocument();
    });
  });

  it('deletes a project via the actions menu and refreshes the list', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'proj-1',
          projectId: 'PRJ0001',
          key: 'ENG',
          name: 'Engineering',
          description: 'Core platform team',
          status: 'active',
          memberCount: 3,
          taskCount: 8,
        },
      ],
    });
    (apiClient.delete as jest.Mock).mockResolvedValue({ success: true, message: 'Deleted' });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    const getCallsBeforeDelete = (apiClient.get as jest.Mock).mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete project/i }));

    expect(screen.getByText(/are you sure you want to delete "Engineering"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }));

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/projects/PRJ0001');
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/are you sure you want to delete "Engineering"/i)
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect((apiClient.get as jest.Mock).mock.calls.length).toBeGreaterThan(getCallsBeforeDelete);
    });
  });

  it('shows a delete error and allows cancelling without closing the modal state incorrectly', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'proj-1',
          projectId: 'PRJ0001',
          key: 'ENG',
          name: 'Engineering',
          description: 'Core platform team',
          status: 'active',
          memberCount: 3,
          taskCount: 8,
        },
      ],
    });
    (apiClient.delete as jest.Mock).mockRejectedValue(new Error('Project has active tasks'));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete project/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }));

    expect(await screen.findByText('Project has active tasks')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByText('Project has active tasks')).not.toBeInTheDocument();
    });
  });

  it('renders project card edge cases: unassigned lead, no description, and archived status', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'proj-unassigned',
          key: 'UNA',
          name: 'Unassigned Proj',
          description: '',
          status: 'archived',
          memberCount: undefined,
          taskCount: undefined,
          leadId: null,
        },
        {
          id: 'proj-lead-fallback',
          key: 'FB',
          name: 'Fallback Lead Proj',
          description: 'A project with blank lead name',
          status: 'active',
          leadId: { firstName: '', lastName: '' },
        },
      ],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    expect(await screen.findByText('No description provided.')).toBeInTheDocument();
    expect(screen.getByText('No lead assigned')).toBeInTheDocument();
    expect(screen.getAllByText('0 members')).toHaveLength(2);
    expect(screen.getAllByText('0 tasks')).toHaveLength(2);
    expect(screen.getByText('Lead')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fallback Lead Proj' }));
    expect(mockPush).toHaveBeenCalledWith('/projects/proj-lead-fallback');
  });

  it('supports pagination controls, status filter, and editing a project', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 25,
        totalPages: 3,
        currentPage: 1,
        limit: 10,
        hasNextPage: true,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'proj-page-1',
          key: 'PAG',
          name: 'Pagination Project',
          description: 'Testing pagination and edit',
          status: 'active',
          memberCount: 2,
          taskCount: 5,
        },
      ],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    expect(await screen.findByText('Pagination Project')).toBeInTheDocument();

    // Open Edit Drawer and cancel
    fireEvent.click(screen.getByRole('button', { name: /actions for pagination project/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /edit project/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Trigger pagination page change
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);

    // Limit change
    const limitSelect = screen.getByLabelText(/rows per page/i);
    fireEvent.change(limitSelect, { target: { value: '20' } });

    // Filter change
    const statusSelect = screen.getByText('All Status');
    fireEvent.keyDown(statusSelect, { key: 'ArrowDown' });
    const archivedOption = await screen.findByText('Archived');
    fireEvent.click(archivedOption);
  });

  it('triggers handleRefresh when create or edit drawer succeeds', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'proj-success',
          id: 'proj-success',
          key: 'SUC',
          name: 'Success Proj',
          status: 'active',
        },
      ],
    });
    (apiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      data: { _id: 'new-p', id: 'new-p', name: 'New Project', key: 'NEW' },
    });
    (apiClient.put as jest.Mock).mockResolvedValue({
      success: true,
      data: { _id: 'proj-success', id: 'proj-success', name: 'Updated Success Proj' },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    expect(await screen.findByText('Success Proj')).toBeInTheDocument();

    // Trigger create drawer success
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));
    const nameInput = await screen.findByPlaceholderText('e.g. Customer Portal Revamp');
    fireEvent.change(nameInput, {
      target: { value: 'New Project' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Create Project' })[1]);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });

    // Trigger edit drawer success
    fireEvent.click(screen.getByRole('button', { name: /actions for success proj/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /edit project/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalled();
    });
  });

  it('renders loading state when isLoading is true and projects list is empty', () => {
    const store = configureStore({
      reducer: { auth: authReducer, ui: uiReducer, projects: projectsReducer },
      preloadedState: {
        projects: {
          cachedPages: {},
          memberCandidates: [],
          currentPage: 1,
          limit: 12,
          search: '',
          filters: {},
          totalItems: 0,
          totalPages: 1,
          isLoading: true,
          isMemberCandidatesLoading: false,
          isActionLoading: false,
          error: null,
          ttlMs: 60000,
        },
      },
    });

    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
  });

  it('handles delete on a project without projectId or id with fallback to empty string and error fallback', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          _id: 'proj-no-key',
          key: 'NOK',
          name: 'No Key Project',
          status: 'active',
        },
      ],
    });
    (apiClient.delete as jest.Mock).mockRejectedValue(new Error(''));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    expect(await screen.findByText('No Key Project')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /actions for no key project/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete project/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }));
    expect(
      await screen.findByText('Failed to delete project. Please ensure it has no active tasks.')
    ).toBeInTheDocument();
  });

  it('handles delete on a project with id only and no projectId', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
      data: [
        {
          id: 'proj-id-only',
          key: 'IDO',
          name: 'ID Only Project',
          status: 'active',
        },
      ],
    });
    (apiClient.delete as jest.Mock).mockResolvedValue({ success: true });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    expect(await screen.findByText('ID Only Project')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /actions for id only project/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /delete project/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }));
    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/projects/proj-id-only');
    });
  });
});
