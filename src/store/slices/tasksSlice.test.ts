import tasksReducer, {
  moveTaskLocally,
  clearTasksError,
  resetBoard,
  fetchBoardTasks,
  createTaskThunk,
  updateTaskThunk,
  updateTaskStatusThunk,
  deleteTaskThunk,
  TasksState,
} from './tasksSlice';
import { tasksService } from '@/services';

jest.mock('@/services');

describe('tasksSlice Redux Reducer & Async Thunks', () => {
  const initialTasksState: TasksState = {
    boardProjectId: null,
    tasks: [],
    isBoardLoading: false,
    isActionLoading: false,
    error: null,
    lastFetchedAt: null,
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(tasksReducer(undefined, { type: 'unknown' })).toEqual(initialTasksState);
  });

  describe('synchronous reducers', () => {
    it('moveTaskLocally updates status and order of the matching task', () => {
      const populated = { ...initialTasksState, tasks: [mockTask] };
      const state = tasksReducer(
        populated,
        moveTaskLocally({ taskId: 'task-1', status: 'In Progress', order: 2 })
      );
      expect(state.tasks[0].status).toBe('In Progress');
      expect(state.tasks[0].order).toBe(2);
    });

    it('moveTaskLocally is a no-op for an unknown task id', () => {
      const populated = { ...initialTasksState, tasks: [mockTask] };
      const state = tasksReducer(
        populated,
        moveTaskLocally({ taskId: 'missing', status: 'Done', order: 0 })
      );
      expect(state.tasks[0]).toEqual(mockTask);
    });

    it('clearTasksError resets the error', () => {
      const populated = { ...initialTasksState, error: 'boom' };
      expect(tasksReducer(populated, clearTasksError()).error).toBeNull();
    });

    it('resetBoard clears board state', () => {
      const populated = {
        ...initialTasksState,
        boardProjectId: 'proj-1',
        tasks: [mockTask],
        lastFetchedAt: Date.now(),
      };
      const state = tasksReducer(populated, resetBoard());
      expect(state.boardProjectId).toBeNull();
      expect(state.tasks).toEqual([]);
      expect(state.lastFetchedAt).toBeNull();
    });
  });

  describe('fetchBoardTasks thunk', () => {
    it('loads the board and flips isBoardLoading for a non-silent fetch', async () => {
      (tasksService.getBoardTasks as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockTask],
      });

      const dispatch = jest.fn();
      const thunk = fetchBoardTasks({ projectId: 'proj-1' });
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(result.payload).toEqual({ projectId: 'proj-1', tasks: [mockTask] });

      const state = tasksReducer(
        initialTasksState,
        fetchBoardTasks.fulfilled({ projectId: 'proj-1', tasks: [mockTask] }, 'req-1', {
          projectId: 'proj-1',
        })
      );
      expect(state.tasks).toEqual([mockTask]);
      expect(state.boardProjectId).toBe('proj-1');
    });

    it('does not surface an error banner for a silent background poll failure', () => {
      const state = tasksReducer(
        initialTasksState,
        fetchBoardTasks.rejected(
          new Error('fail'),
          'req-1',
          { projectId: 'proj-1', silent: true },
          'fail'
        )
      );
      expect(state.error).toBeNull();
    });

    it('surfaces an error for a non-silent fetch failure', () => {
      const state = tasksReducer(
        initialTasksState,
        fetchBoardTasks.rejected(
          new Error('fail'),
          'req-1',
          { projectId: 'proj-1' },
          'Failed to load the project board'
        )
      );
      expect(state.error).toBe('Failed to load the project board');
    });

    it('does not set isBoardLoading for a silent poll', () => {
      const state = tasksReducer(
        initialTasksState,
        fetchBoardTasks.pending('req-1', { projectId: 'proj-1', silent: true })
      );
      expect(state.isBoardLoading).toBe(false);
    });
  });

  describe('createTaskThunk', () => {
    it('appends the created task when it belongs to the loaded board', () => {
      const populated = { ...initialTasksState, boardProjectId: 'proj-1', tasks: [] };
      const state = tasksReducer(
        populated,
        createTaskThunk.fulfilled(mockTask, 'req-1', {
          projectId: 'proj-1',
          title: 'Fix login bug',
        })
      );
      expect(state.tasks).toEqual([mockTask]);
    });

    it('does not append a task created for a different board', () => {
      const populated = { ...initialTasksState, boardProjectId: 'other-proj', tasks: [] };
      const state = tasksReducer(
        populated,
        createTaskThunk.fulfilled(mockTask, 'req-1', {
          projectId: 'proj-1',
          title: 'Fix login bug',
        })
      );
      expect(state.tasks).toEqual([]);
    });
  });

  describe('updateTaskThunk', () => {
    it('replaces the matching task in place', () => {
      const populated = { ...initialTasksState, tasks: [mockTask] };
      const updated = { ...mockTask, title: 'Fixed login bug' };
      const state = tasksReducer(
        populated,
        updateTaskThunk.fulfilled(updated, 'req-1', {
          id: 'ENG-1',
          data: { title: 'Fixed login bug' },
        })
      );
      expect(state.tasks[0].title).toBe('Fixed login bug');
    });
  });

  describe('updateTaskStatusThunk', () => {
    it('reconciles local state with the server response', () => {
      const populated = { ...initialTasksState, tasks: [mockTask] };
      const updated = { ...mockTask, status: 'Done' as const, order: 3 };
      const state = tasksReducer(
        populated,
        updateTaskStatusThunk.fulfilled(updated, 'req-1', {
          id: 'ENG-1',
          data: { status: 'Done', order: 3 },
        })
      );
      expect(state.tasks[0].status).toBe('Done');
      expect(state.tasks[0].order).toBe(3);
    });

    it('surfaces an error message on rejection so the board can resync', () => {
      const state = tasksReducer(
        initialTasksState,
        updateTaskStatusThunk.rejected(
          new Error('fail'),
          'req-1',
          { id: 'ENG-1', data: { status: 'Done' } },
          'Failed to move task'
        )
      );
      expect(state.error).toBe('Failed to move task');
    });
  });

  describe('deleteTaskThunk', () => {
    it('removes the deleted task from state', () => {
      const populated = { ...initialTasksState, tasks: [mockTask] };
      const state = tasksReducer(populated, deleteTaskThunk.fulfilled('task-1', 'req-1', 'ENG-1'));
      expect(state.tasks).toEqual([]);
    });

    it('handles rejection', () => {
      const state = tasksReducer(
        initialTasksState,
        deleteTaskThunk.rejected(new Error('fail'), 'req-1', 'ENG-1', 'Failed to delete task')
      );
      expect(state.error).toBe('Failed to delete task');
    });
  });
  const operations = [
    {
      name: 'fetch',
      run: () => fetchBoardTasks({ projectId: 'proj-1' }),
      service: tasksService.getBoardTasks,
      fallback: 'Failed to load the project board.',
    },
    {
      name: 'create',
      run: () => createTaskThunk({ projectId: 'proj-1', title: 'New' }),
      service: tasksService.createTask,
      fallback: 'Failed to create task.',
    },
    {
      name: 'update',
      run: () => updateTaskThunk({ id: 'task-1', data: { title: 'Updated' } }),
      service: tasksService.updateTask,
      fallback: 'Failed to update task.',
    },
    {
      name: 'move',
      run: () => updateTaskStatusThunk({ id: 'task-1', data: { status: 'Done' } }),
      service: tasksService.updateTaskStatus,
      fallback: 'Failed to move task.',
    },
    {
      name: 'delete',
      run: () => deleteTaskThunk('task-1'),
      service: tasksService.deleteTask,
      fallback: 'Failed to delete task.',
    },
  ];

  describe.each(operations)('$name requests', ({ run, service, fallback, name }) => {
    it.each([new Error('Offline'), null])(
      'rejects failed requests and clears loading: %j',
      async (error) => {
        (service as jest.Mock).mockRejectedValue(error);
        const dispatch = jest.fn();
        const result = await run()(dispatch, jest.fn(), undefined);
        expect(result.payload).toBe(error instanceof Error ? 'Offline' : fallback);
        let state = initialTasksState;
        for (const [action] of dispatch.mock.calls) state = tasksReducer(state, action);
        expect(state.isActionLoading).toBe(false);
        expect(state.isBoardLoading).toBe(false);
        expect(state.error).toBe(error instanceof Error ? 'Offline' : fallback);
      }
    );

    it('returns the service result', async () => {
      (service as jest.Mock).mockResolvedValue({
        success: true,
        data: name === 'fetch' ? [mockTask] : mockTask,
      });
      const result = await run()(jest.fn(), jest.fn(), undefined);
      expect(result.meta.requestStatus).toBe('fulfilled');
      if (name === 'fetch')
        expect(result.payload).toEqual({ projectId: 'proj-1', tasks: [mockTask] });
      else if (name === 'delete') expect(result.payload).toBe('task-1');
      else expect(result.payload).toEqual(mockTask);
    });
  });

  it('handles an empty board response', async () => {
    (tasksService.getBoardTasks as jest.Mock).mockResolvedValue({ success: true });
    const result = await fetchBoardTasks({ projectId: 'proj-1' })(jest.fn(), jest.fn(), undefined);
    expect(result.payload).toEqual({ projectId: 'proj-1', tasks: [] });
  });

  it.each([
    fetchBoardTasks.rejected(null, 'request', { projectId: 'proj-1' }),
    createTaskThunk.rejected(null, 'request', { projectId: 'proj-1', title: 'New' }),
    updateTaskThunk.rejected(null, 'request', { id: 'task-1', data: {} }),
    updateTaskStatusThunk.rejected(null, 'request', { id: 'task-1', data: { status: 'Done' } }),
    deleteTaskThunk.rejected(null, 'request', 'task-1'),
  ])('provides a fallback for rejected action $type', (action) => {
    expect(tasksReducer(initialTasksState, action).error).toMatch(/^Failed to /);
  });

  it.each([{ id: 'id-1' }, { taskKey: 'KEY-1' }])('moves tasks identified by %j', (identity) => {
    const task = { ...mockTask, _id: undefined, ...identity };
    const state = tasksReducer(
      { ...initialTasksState, tasks: [task] },
      moveTaskLocally({ taskId: identity.id || identity.taskKey || '', status: 'Done', order: 3 })
    );
    expect(state.tasks[0].status).toBe('Done');
  });

  it('ignores updates for tasks outside the current board', () => {
    const update = tasksReducer(
      initialTasksState,
      updateTaskThunk.fulfilled(mockTask, 'request', { id: 'task-1', data: {} })
    );
    const move = tasksReducer(
      initialTasksState,
      updateTaskStatusThunk.fulfilled(mockTask, 'request', {
        id: 'task-1',
        data: { status: 'Todo' },
      })
    );
    expect(update.tasks).toEqual([]);
    expect(move.tasks).toEqual([]);
  });
});
