import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CreateProjectDrawer } from './CreateProjectDrawer';
import { EditProjectDrawer } from './EditProjectDrawer';
import { ProjectActionsMenu } from './ProjectActionsMenu';
import { ProjectGrid } from './ProjectGrid';
import authReducer from '@/store/slices/authSlice';
import projectsReducer from '@/store/slices/projectsSlice';
import { projectsService } from '@/services';
import { Project } from '@/types';

jest.mock('@/services');

const mockProject: Project = {
  _id: 'proj-1',
  projectId: 'PRJ0001',
  key: 'ENG',
  name: 'Engineering',
  description: 'Core platform team',
  status: 'active',
  leadId: { _id: 'lead-1', firstName: 'Jane', lastName: 'Doe' },
  members: [{ _id: 'lead-1', firstName: 'Jane', lastName: 'Doe' }],
};

const createMockStore = () =>
  configureStore({
    reducer: { auth: authReducer, projects: projectsReducer },
    preloadedState: {
      auth: {
        user: { id: 'lead-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    },
  });

describe('Project Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: 'lead-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      })
    );
    (projectsService.getMemberCandidates as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { _id: 'lead-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
        { _id: 'member-2', firstName: 'John', lastName: 'Smith', email: 'john@example.com' },
      ],
    });
  });

  describe('CreateProjectDrawer', () => {
    it('shows a validation error when submitting without a name', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <CreateProjectDrawer isOpen onClose={jest.fn()} />
        </Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /create project/i }));
      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });
    });

    it('creates a project with the entered name', async () => {
      (projectsService.createProject as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProject,
      });
      const store = createMockStore();
      const handleClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateProjectDrawer isOpen onClose={handleClose} />
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText(/customer portal revamp/i), {
        target: { value: 'Engineering' },
      });

      const submitButtons = screen.getAllByRole('button', { name: /create project/i });
      fireEvent.click(submitButtons[submitButtons.length - 1]);

      await waitFor(() => {
        expect(projectsService.createProject).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Engineering' })
        );
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('toggles a non-lead member selection on and off', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <CreateProjectDrawer isOpen onClose={jest.fn()} />
        </Provider>
      );

      const checkbox = (await screen.findByText('John Smith'))
        .closest('label')
        ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('shows an error message when project creation is rejected', async () => {
      (projectsService.createProject as jest.Mock).mockRejectedValue(
        new Error('Project key already exists')
      );
      const store = createMockStore();
      const handleClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateProjectDrawer isOpen onClose={handleClose} />
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText(/customer portal revamp/i), {
        target: { value: 'Engineering' },
      });

      const submitButtons = screen.getAllByRole('button', { name: /create project/i });
      fireEvent.click(submitButtons[submitButtons.length - 1]);

      expect(await screen.findByText('Project key already exists')).toBeInTheDocument();
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('shows default error when project creation rejects without message and tests key input', async () => {
      (projectsService.createProject as jest.Mock).mockRejectedValueOnce(new Error(''));
      const store = createMockStore();
      const handleClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateProjectDrawer isOpen onClose={handleClose} />
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText(/customer portal revamp/i), {
        target: { value: 'Engineering' },
      });

      // Type key with lowercase and symbols to test uppercase and regex filter (line 161)
      const keyInput = screen.getByPlaceholderText(/auto-generated if left blank/i);
      fireEvent.change(keyInput, { target: { value: 'eng-101' } });
      expect(keyInput).toHaveValue('ENG101');

      const submitButtons = screen.getAllByRole('button', { name: /create project/i });
      fireEvent.click(submitButtons[submitButtons.length - 1]);

      expect(
        await screen.findByText('Failed to create project. Please try again.')
      ).toBeInTheDocument();
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('creates a project successfully with null user and calls onSuccess callback', async () => {
      localStorage.clear();
      (projectsService.createProject as jest.Mock).mockResolvedValue({
        success: true,
        data: mockProject,
      });
      const storeWithoutUser = configureStore({
        reducer: { auth: authReducer, projects: projectsReducer },
        preloadedState: {
          auth: {
            user: null,
            isAuthenticated: false,
            isLogoutModalOpen: false,
            isLoggingOut: false,
            isChangePasswordModalOpen: false,
            rememberMe: false,
          },
        },
      });
      const handleClose = jest.fn();
      const handleSuccess = jest.fn();

      render(
        <Provider store={storeWithoutUser}>
          <CreateProjectDrawer isOpen onClose={handleClose} onSuccess={handleSuccess} />
        </Provider>
      );

      // Trigger validation error first
      fireEvent.click(screen.getByRole('button', { name: /create project/i }));
      expect(await screen.findByText('Project name is required')).toBeInTheDocument();

      // Type into name input to trigger error clear branch (val.trim() is truthy)
      const nameInput = screen.getByPlaceholderText(/customer portal revamp/i);
      fireEvent.change(nameInput, { target: { value: 'New Team Project' } });
      expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();

      const submitButtons = screen.getAllByRole('button', { name: /create project/i });
      fireEvent.click(submitButtons[submitButtons.length - 1]);

      await waitFor(() => {
        expect(projectsService.createProject).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'New Team Project' })
        );
        expect(handleClose).toHaveBeenCalled();
        expect(handleSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('EditProjectDrawer', () => {
    it('pre-fills the form with the project data', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <EditProjectDrawer isOpen onClose={jest.fn()} project={mockProject} />
        </Provider>
      );

      expect(await screen.findByDisplayValue('Engineering')).toBeInTheDocument();
      expect(screen.getByText('ENG')).toBeInTheDocument();
    });

    it('renders nothing when no project is provided', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <EditProjectDrawer isOpen onClose={jest.fn()} project={null} />
        </Provider>
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('toggles a non-lead member selection on and off', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <EditProjectDrawer isOpen onClose={jest.fn()} project={mockProject} />
        </Provider>
      );

      const checkbox = (await screen.findByText('John Smith'))
        .closest('label')
        ?.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('ProjectActionsMenu', () => {
    it('invokes the correct callback for each menu action', () => {
      const onOpenBoard = jest.fn();
      const onEdit = jest.fn();
      const onArchiveToggle = jest.fn();
      const onDelete = jest.fn();

      render(
        <ProjectActionsMenu
          project={mockProject}
          onOpenBoard={onOpenBoard}
          onEdit={onEdit}
          onArchiveToggle={onArchiveToggle}
          onDelete={onDelete}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /open board/i }));
      expect(onOpenBoard).toHaveBeenCalledWith(mockProject);

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /edit project/i }));
      expect(onEdit).toHaveBeenCalledWith(mockProject);

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /archive project/i }));
      expect(onArchiveToggle).toHaveBeenCalledWith(mockProject);

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /delete project/i }));
      expect(onDelete).toHaveBeenCalledWith(mockProject);
    });

    it('shows "Restore Project" instead of "Archive Project" for an already-archived project', () => {
      const archivedProject = { ...mockProject, status: 'archived' as const };
      const onArchiveToggle = jest.fn();

      render(
        <ProjectActionsMenu
          project={archivedProject}
          onOpenBoard={jest.fn()}
          onEdit={jest.fn()}
          onArchiveToggle={onArchiveToggle}
          onDelete={jest.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      expect(
        screen.queryByRole('menuitem', { name: /^archive project$/i })
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('menuitem', { name: /restore project/i }));
      expect(onArchiveToggle).toHaveBeenCalledWith(archivedProject);
    });

    it('hides edit, archive, and delete when permissions are not granted', () => {
      render(
        <ProjectActionsMenu
          project={mockProject}
          onOpenBoard={jest.fn()}
          onEdit={jest.fn()}
          onArchiveToggle={jest.fn()}
          onDelete={jest.fn()}
          canEdit={false}
          canDelete={false}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      expect(screen.queryByRole('menuitem', { name: /edit project/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /archive project/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /delete project/i })).not.toBeInTheDocument();
    });

    it('falls back to the id when projectId is unavailable', () => {
      const projectWithoutProjectId = { ...mockProject, projectId: undefined, id: 'mongo-id-1' };
      render(
        <ProjectActionsMenu
          project={projectWithoutProjectId}
          onOpenBoard={jest.fn()}
          onEdit={jest.fn()}
          onArchiveToggle={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      expect(screen.getByTestId('project-actions-mongo-id-1')).toBeInTheDocument();
    });

    it('falls back to _id when neither projectId nor id is available', () => {
      const projectWithOnlyMongoId = { ...mockProject, projectId: undefined, id: undefined };
      render(
        <ProjectActionsMenu
          project={projectWithOnlyMongoId}
          onOpenBoard={jest.fn()}
          onEdit={jest.fn()}
          onArchiveToggle={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /actions for engineering/i }));
      expect(screen.getByTestId(`project-actions-${mockProject._id}`)).toBeInTheDocument();
    });
  });
  it('saves edited project details and selected members', async () => {
    jest
      .mocked(projectsService.updateProject)
      .mockResolvedValue({ success: true, data: mockProject });
    const onClose = jest.fn();
    const onSuccess = jest.fn();
    render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={mockProject} onClose={onClose} onSuccess={onSuccess} />
      </Provider>
    );
    fireEvent.change(screen.getByDisplayValue('Engineering'), { target: { value: 'Platform' } });
    fireEvent.change(screen.getByDisplayValue('Core platform team'), {
      target: { value: 'Updated details' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(projectsService.updateProject).toHaveBeenCalledWith(
      'PRJ0001',
      expect.objectContaining({
        name: 'Platform',
        description: 'Updated details',
        memberIds: ['lead-1'],
      })
    );
  });

  it('validates an empty edited name', async () => {
    render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={mockProject} onClose={jest.fn()} />
      </Provider>
    );
    fireEvent.change(screen.getByDisplayValue('Engineering'), { target: { value: ' ' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Project name is required')).toBeInTheDocument();
  });

  it('shows a failed project update without closing the drawer', async () => {
    jest
      .mocked(projectsService.updateProject)
      .mockRejectedValueOnce(new Error('Update unavailable'));
    const onClose = jest.fn();
    render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={mockProject} onClose={onClose} />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Update unavailable')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows default error when updateProject rejects without a message', async () => {
    (projectsService.updateProject as jest.Mock).mockRejectedValueOnce(new Error(''));
    const onClose = jest.fn();
    render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={mockProject} onClose={onClose} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(
      await screen.findByText('Failed to update project. Please try again.')
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles member toggling and lead assignment in CreateProjectDrawer', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CreateProjectDrawer isOpen onClose={jest.fn()} />
      </Provider>
    );

    const nameInput = await screen.findByPlaceholderText(/Customer Portal Revamp/i);
    fireEvent.change(nameInput, {
      target: { value: 'Alpha' },
    });

    const memberCheckboxes = await screen.findAllByRole('checkbox');
    const memberCheckbox = memberCheckboxes[1]; // non-lead member
    fireEvent.click(memberCheckbox); // toggle on
    fireEvent.click(memberCheckbox); // toggle off
    expect(memberCheckbox).not.toBeChecked();
  });

  it('renders null when project is null in EditProjectDrawer', () => {
    const { container } = render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={null} onClose={jest.fn()} />
      </Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('handles all member formats, project fallbacks, and missing identifier in EditProjectDrawer', async () => {
    // Project with members formatted as string, object with _id, object with id only, and object with neither
    const variedProject: Project = {
      _id: 'proj-varied',
      key: 'VAR',
      name: '',
      description: '',
      status: 'archived',
      members: [
        'str-member-1',
        { _id: 'm-obj-1', firstName: 'A', lastName: 'B' },
        { id: 'm-obj-2', firstName: 'C', lastName: 'D' },
        {},
      ],
    };

    const { unmount } = render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={variedProject} onClose={jest.fn()} />
      </Provider>
    );

    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // toggle off
    fireEvent.click(checkboxes[1]); // toggle back on
    unmount();

    // Project with id only (no projectId and no _id)
    const idOnlyProject: Project = {
      id: 'proj-id-only',
      key: 'IDO',
      name: 'ID Only Project',
      status: 'active',
    };
    (projectsService.updateProject as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: idOnlyProject,
    });
    const onCloseIdOnly = jest.fn();
    const { unmount: unmountIdOnly } = render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={idOnlyProject} onClose={onCloseIdOnly} />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(onCloseIdOnly).toHaveBeenCalled());
    unmountIdOnly();

    // Project with _id only (no projectId and no id)
    const mongoOnlyProject: Project = {
      _id: 'proj-mongo-only',
      key: 'MGO',
      name: 'Mongo Only Project',
      status: 'active',
    };
    (projectsService.updateProject as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mongoOnlyProject,
    });
    const onCloseMongo = jest.fn();
    const { unmount: unmountMongo } = render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={mongoOnlyProject} onClose={onCloseMongo} />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(onCloseMongo).toHaveBeenCalled());
    unmountMongo();

    // Project without any identifier (returns early from handleSubmit)
    const noIdProject: Project = {
      key: 'NOID',
      name: 'No ID Project',
      status: 'active',
    };
    render(
      <Provider store={createMockStore()}>
        <EditProjectDrawer isOpen project={noIdProject} onClose={jest.fn()} />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
  });
});

describe('ProjectGrid', () => {
  const gridProps = {
    onOpenBoard: jest.fn(),
    onEdit: jest.fn(),
    onArchiveToggle: jest.fn(),
    onDelete: jest.fn(),
    canEdit: true,
    canDelete: true,
  };

  it('shows a loading spinner when isLoading is true and there is no data yet', () => {
    render(
      <ProjectGrid
        {...gridProps}
        projects={[]}
        isLoading
        emptyTitle="No Projects"
        emptyDescription="none"
      />
    );
    expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
  });

  it('shows the empty state with the given title/description/action when there are no projects', () => {
    render(
      <ProjectGrid
        {...gridProps}
        projects={[]}
        isLoading={false}
        emptyTitle="No Archived Projects"
        emptyDescription="Nothing archived yet."
        emptyAction={<button type="button">Create one</button>}
      />
    );
    expect(screen.getByText('No Archived Projects')).toBeInTheDocument();
    expect(screen.getByText('Nothing archived yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create one' })).toBeInTheDocument();
  });

  it('renders a card per project with its key, name, lead, and status badge', () => {
    render(
      <ProjectGrid
        {...gridProps}
        projects={[mockProject]}
        isLoading={false}
        emptyTitle="No Projects"
        emptyDescription="none"
      />
    );
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('ENG')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onOpenBoard when the project name is clicked', () => {
    const onOpenBoard = jest.fn();
    render(
      <ProjectGrid
        {...gridProps}
        onOpenBoard={onOpenBoard}
        projects={[mockProject]}
        isLoading={false}
        emptyTitle="No Projects"
        emptyDescription="none"
      />
    );
    fireEvent.click(screen.getByText('Engineering'));
    expect(onOpenBoard).toHaveBeenCalledWith(mockProject);
  });
});
