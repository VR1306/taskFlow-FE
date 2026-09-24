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

  it('shows the filtered empty state message once a search term is applied', async () => {
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

    fireEvent.change(screen.getByPlaceholderText(/search projects/i), {
      target: { value: 'nonexistent' },
    });

    await waitFor(() => {
      expect(
        screen.getByText('No projects match your current search or filter criteria.')
      ).toBeInTheDocument();
    });
  });

  it('shows archived empty state and allows switching to active tab via empty action', async () => {
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

    // Switch to Archived tab
    fireEvent.click(await screen.findByRole('tab', { name: /archived projects/i }));

    expect(await screen.findByText('No Archived Projects')).toBeInTheDocument();
    expect(
      screen.getByText('Projects you archive will show up here, out of the active list.')
    ).toBeInTheDocument();

    const viewActiveBtn = screen.getByRole('button', { name: /view active projects/i });
    fireEvent.click(viewActiveBtn);

    expect(screen.getByRole('tab', { name: /active projects/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('allows clearing the search input with the clear button', async () => {
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

    const searchInput = screen.getByPlaceholderText(/search projects/i);
    fireEvent.change(searchInput, { target: { value: 'Something' } });
    expect(searchInput).toHaveValue('Something');

    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue('');
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

    expect(screen.getByText(/permanently delete "Engineering"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Permanently' }));

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/projects/PRJ0001');
    });

    await waitFor(() => {
      expect(screen.queryByText(/permanently delete "Engineering"/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect((apiClient.get as jest.Mock).mock.calls.length).toBeGreaterThan(getCallsBeforeDelete);
    });
  });

  it('archives an active project via the actions menu, sending status: archived', async () => {
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
    (apiClient.put as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'proj-1', projectId: 'PRJ0001', name: 'Engineering', status: 'archived' },
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

    fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /^archive project$/i }));

    expect(screen.getByText(/archive "Engineering"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Archive Project' }));

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        '/projects/PRJ0001',
        expect.objectContaining({ status: 'archived' })
      );
    });
  });

  it('shows active and archived projects in their own tabs, switching views based on the selected tab', async () => {
    (apiClient.get as jest.Mock).mockImplementation((endpoint: string) => {
      if (endpoint.includes('status=archived')) {
        return Promise.resolve({
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
              _id: 'proj-archived',
              projectId: 'PRJ0002',
              key: 'OLD',
              name: 'Legacy Project',
              description: 'Retired project',
              status: 'archived',
              memberCount: 1,
              taskCount: 0,
            },
          ],
        });
      }
      return Promise.resolve({
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
            _id: 'proj-active',
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
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectsPage />
      </Provider>
    );

    // Active tab shows the active project; the archived one isn't displayed in this tab.
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });
    expect(screen.queryByText('Legacy Project')).not.toBeInTheDocument();

    // The tabs reflect the respective counts.
    const archivedTab = await screen.findByRole('tab', {
      name: /archived projects/i,
    });
    expect(screen.getByRole('tab', { name: /active projects/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    // Switch to Archived tab
    fireEvent.click(archivedTab);

    expect(await screen.findByText('Legacy Project')).toBeInTheDocument();
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
    expect(archivedTab).toHaveAttribute('aria-selected', 'true');

    // Switch back to Active tab
    fireEvent.click(screen.getByRole('tab', { name: /active projects/i }));
    expect(await screen.findByText('Engineering')).toBeInTheDocument();
    expect(screen.queryByText('Legacy Project')).not.toBeInTheDocument();
  });

  it('restores an archived project via the actions menu, sending status: active', async () => {
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
          status: 'archived',
          memberCount: 3,
          taskCount: 8,
        },
      ],
    });
    (apiClient.put as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'proj-1', projectId: 'PRJ0001', name: 'Engineering', status: 'active' },
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

    fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /restore project/i }));

    expect(screen.getByText(/restore "Engineering"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Restore Project' }));

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        '/projects/PRJ0001',
        expect.objectContaining({ status: 'active' })
      );
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

    fireEvent.click(screen.getByRole('button', { name: 'Delete Permanently' }));

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

  it('supports pagination controls and editing a project', async () => {
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
          archivedItems: [],
          archivedTotalItems: 0,
          archivedTotalPages: 1,
          archivedCurrentPage: 1,
          archivedLimit: 12,
          isArchivedLoading: false,
          archivedError: null,
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

    fireEvent.click(screen.getByRole('button', { name: 'Delete Permanently' }));
    expect(await screen.findByText('Failed to delete project.')).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: 'Delete Permanently' }));
    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/projects/proj-id-only');
    });
  });
});
