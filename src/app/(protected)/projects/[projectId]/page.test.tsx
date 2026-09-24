import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectBoardPage from './page';
import { projectsService, tasksService } from '@/services';
import authReducer from '@/store/slices/authSlice';
import tasksReducer from '@/store/slices/tasksSlice';

jest.mock('@/services');

jest.mock('@/components/tasks', () => {
  const actual = jest.requireActual('@/components/tasks');
  return {
    ...actual,
    KanbanBoard: ({
      tasks,
      onTaskClick,
      onMoveFailed,
    }: {
      tasks: { _id?: string; id?: string; taskKey: string; title: string }[];
      onTaskClick: (task: unknown) => void;
      onMoveFailed?: () => void;
    }) => (
      <div>
        {tasks.map((t) => (
          <div key={t._id || t.id || t.taskKey} onClick={() => onTaskClick(t)}>
            <span>{t.taskKey}</span>
            <span>{t.title}</span>
          </div>
        ))}
        <button type="button" onClick={() => onMoveFailed?.()}>
          Simulate Move Failure
        </button>
      </div>
    ),
  };
});

const mockPush = jest.fn();
let mockParams: Record<string, string | undefined> = { projectId: 'proj-1' };

jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/projects/proj-1',
}));

const mockProject = {
  _id: 'proj-1',
  projectId: 'PRJ0001',
  key: 'ENG',
  name: 'Engineering',
  status: 'active' as const,
  members: [{ _id: 'user-1', firstName: 'Jane', lastName: 'Doe' }],
};

const mockTask = {
  _id: 'task-1',
  taskKey: 'ENG-1',
  projectId: 'proj-1',
  title: 'Fix login bug',
  type: 'Bug' as const,
  status: 'Todo' as const,
  priority: 'High' as const,
  order: 0,
  assigneeId: { _id: 'user-1', firstName: 'Jane', lastName: 'Doe' },
};

const mockTask2 = {
  _id: 'task-2',
  taskKey: 'ENG-2',
  projectId: 'proj-1',
  title: 'Write docs',
  type: 'Task' as const,
  status: 'Todo' as const,
  priority: 'Low' as const,
  order: 1,
};

const createMockStore = () =>
  configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer },
  });

describe('ProjectBoardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { projectId: 'proj-1' };
    mockPush.mockClear();
    localStorage.clear();
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({ role: 'Taskflow Admin', permissions: ['*'] })
    );
    (projectsService.getProjectById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockProject,
    });
    (tasksService.getBoardTasks as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockTask],
    });
  });

  it('renders the project header and board with tasks', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    expect(screen.getByText('ENG-1')).toBeInTheDocument();
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('opens the task detail drawer when a task card is clicked', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Fix login bug'));

    await waitFor(() => {
      expect(screen.getByText('ENG-1: Fix login bug')).toBeInTheDocument();
    });
  });

  it('shows a not-found state when the project fails to load and navigates back to projects', async () => {
    (projectsService.getProjectById as jest.Mock).mockRejectedValue(new Error('Not found'));
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /back to projects/i }));
    expect(mockPush).toHaveBeenCalledWith('/projects');
  });

  it('filters tasks by search input', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/search tasks by title or key/i), {
      target: { value: 'nonexistent' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
    });
  });

  it('silently polls the board for updates on an interval', async () => {
    jest.useFakeTimers();
    try {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <ProjectBoardPage />
        </Provider>
      );

      await waitFor(() => {
        expect(tasksService.getBoardTasks).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(tasksService.getBoardTasks).toHaveBeenCalledTimes(2);
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('re-fetches the board when a drag-and-drop move fails', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });

    const callsBeforeFailure = (tasksService.getBoardTasks as jest.Mock).mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: /simulate move failure/i }));

    await waitFor(() => {
      expect((tasksService.getBoardTasks as jest.Mock).mock.calls.length).toBeGreaterThan(
        callsBeforeFailure
      );
    });
  });

  it('applies and resets assignee, priority, and type filters', async () => {
    (tasksService.getBoardTasks as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockTask, mockTask2],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.getByText('Write docs')).toBeInTheDocument();
    });

    // Filter to the assignee "Jane Doe" -> only the assigned task remains.
    fireEvent.click(screen.getByRole('button', { name: /^filter/i }));
    fireEvent.mouseDown(screen.getByText('All Assignees'));
    fireEvent.click(screen.getByText('Jane Doe'));
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.queryByText('Write docs')).not.toBeInTheDocument();
    });

    // Re-open and switch to "Unassigned" -> only the unassigned task remains.
    fireEvent.click(screen.getByRole('button', { name: /^filter/i }));
    fireEvent.mouseDown(screen.getByText('Jane Doe'));
    fireEvent.click(screen.getByText('Unassigned'));
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.getByText('Write docs')).toBeInTheDocument();
      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
    });

    // Re-open, reset assignee back to "all", and filter by priority + type instead.
    fireEvent.click(screen.getByRole('button', { name: /^filter/i }));
    fireEvent.mouseDown(screen.getByText('Unassigned'));
    fireEvent.click(screen.getByText('All Assignees'));
    fireEvent.mouseDown(screen.getByText('All Priorities'));
    fireEvent.click(screen.getByText('Low'));
    fireEvent.mouseDown(screen.getByText('All Types'));
    fireEvent.click(screen.getByText('Task'));
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.getByText('Write docs')).toBeInTheDocument();
      expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
    });

    // Re-open and reset all filters -> both tasks reappear.
    fireEvent.click(screen.getByRole('button', { name: /^filter/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset filters/i }));

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.getByText('Write docs')).toBeInTheDocument();
    });
  });

  it('shows a loading indicator while the board tasks are still loading', async () => {
    let resolveTasks: (value: { success: boolean; data: unknown[] }) => void = () => {};
    (tasksService.getBoardTasks as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveTasks = resolve;
      })
    );

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    expect(screen.getByText('Loading board...')).toBeInTheDocument();

    resolveTasks({ success: true, data: [mockTask] });

    await waitFor(() => {
      expect(screen.queryByText('Loading board...')).not.toBeInTheDocument();
    });
  });

  it('navigates back to /projects when clicking header back button', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /back to projects/i }));
    expect(mockPush).toHaveBeenCalledWith('/projects');
  });

  it('opens and closes create task drawer', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(screen.getAllByText('Create Task').length).toBeGreaterThan(1);
    const closeBtn = screen.getByRole('button', { name: 'Close drawer' });
    fireEvent.click(closeBtn);
  });

  it('opens and closes task detail drawer', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Fix login bug'));
    expect(await screen.findByText('ENG-1: Fix login bug')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: 'Close drawer' });
    fireEvent.click(closeBtn);
  });

  it('opens and closes task filter drawer', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^filter/i }));
    const closeBtn = screen.getByRole('button', { name: 'Close drawer' });
    fireEvent.click(closeBtn);
  });

  it('renders archived project with fallback id and filters by assignee id without _id', async () => {
    const archivedProjectWithoutIds = {
      projectId: 'PRJ0002',
      key: 'DOC',
      name: 'Documentation Project',
      status: 'archived' as const,
      members: [{ id: 'user-id-only', firstName: 'Alice', lastName: 'Smith' }],
    };
    (projectsService.getProjectById as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: archivedProjectWithoutIds,
    });
    const taskWithIdOnly = {
      _id: 'task-3',
      taskKey: 'DOC-1',
      projectId: 'proj-1',
      title: 'Setup Guide',
      type: 'Task' as const,
      status: 'Todo' as const,
      priority: 'Low' as const,
      order: 0,
      assigneeId: { id: 'user-id-only', firstName: 'Alice', lastName: 'Smith' },
    };
    (tasksService.getBoardTasks as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [taskWithIdOnly],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Documentation Project')).toBeInTheDocument();
      expect(screen.getByText('archived')).toBeInTheDocument();
    });

    // Test filter with assigneeId === 'user-id-only' (covers assignee.id in line 95)
    fireEvent.click(screen.getByRole('button', { name: /^filter/i }));
    fireEvent.mouseDown(screen.getByText('All Assignees'));
    fireEvent.click(screen.getByText('Alice Smith'));
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    await waitFor(() => {
      expect(screen.getByText('Setup Guide')).toBeInTheDocument();
    });
  });

  it('handles project with explicit id property', async () => {
    const projectWithId = {
      ...mockProject,
      id: 'proj-explicit-id',
    };
    (projectsService.getProjectById as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: projectWithId,
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });
  });

  it('does nothing when projectId is undefined', async () => {
    mockParams = { projectId: undefined };
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ProjectBoardPage />
      </Provider>
    );

    expect(projectsService.getProjectById).not.toHaveBeenCalled();
    expect(tasksService.getBoardTasks).not.toHaveBeenCalled();
  });
});
