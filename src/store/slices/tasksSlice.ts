import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Task,
  TaskStatus,
  BoardTasksResponse,
  TaskResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from '@/types';
import { tasksService } from '@/services';

export interface TasksState {
  boardProjectId: string | null;
  tasks: Task[];
  isBoardLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: TasksState = {
  boardProjectId: null,
  tasks: [],
  isBoardLoading: false,
  isActionLoading: false,
  error: null,
  lastFetchedAt: null,
};

const taskIdentity = (task: Task) => task._id || task.id || task.taskKey;

export const fetchBoardTasks = createAsyncThunk<
  { projectId: string; tasks: Task[] },
  { projectId: string; silent?: boolean },
  { rejectValue: string }
>('tasks/fetchBoardTasks', async ({ projectId }, { rejectWithValue }) => {
  try {
    const response: BoardTasksResponse = await tasksService.getBoardTasks(projectId);
    return { projectId, tasks: response.data || [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load the project board.';
    return rejectWithValue(message);
  }
});

export const createTaskThunk = createAsyncThunk<Task, CreateTaskPayload, { rejectValue: string }>(
  'tasks/createTask',
  async (payload, { rejectWithValue }) => {
    try {
      const response: TaskResponse = await tasksService.createTask(payload);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task.';
      return rejectWithValue(message);
    }
  }
);

export const updateTaskThunk = createAsyncThunk<
  Task,
  { id: string; data: UpdateTaskPayload },
  { rejectValue: string }
>('tasks/updateTask', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response: TaskResponse = await tasksService.updateTask(id, data);
    return response.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update task.';
    return rejectWithValue(message);
  }
});

export const updateTaskStatusThunk = createAsyncThunk<
  Task,
  { id: string; data: UpdateTaskStatusPayload },
  { rejectValue: string }
>('tasks/updateTaskStatus', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response: TaskResponse = await tasksService.updateTaskStatus(id, data);
    return response.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to move task.';
    return rejectWithValue(message);
  }
});

export const deleteTaskThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await tasksService.deleteTask(id);
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task.';
      return rejectWithValue(message);
    }
  }
);

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /** Optimistically reflects a drag-and-drop move before the server confirms it. */
    moveTaskLocally: (
      state,
      action: PayloadAction<{ taskId: string; status: TaskStatus; order: number }>
    ) => {
      const task = state.tasks.find((t) => taskIdentity(t) === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
        task.order = action.payload.order;
      }
    },
    clearTasksError: (state) => {
      state.error = null;
    },
    resetBoard: (state) => {
      state.boardProjectId = null;
      state.tasks = [];
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoardTasks.pending, (state, action) => {
        if (!action.meta.arg.silent) {
          state.isBoardLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchBoardTasks.fulfilled, (state, action) => {
        state.isBoardLoading = false;
        state.boardProjectId = action.payload.projectId;
        state.tasks = action.payload.tasks;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchBoardTasks.rejected, (state, action) => {
        state.isBoardLoading = false;
        if (!action.meta.arg.silent) {
          state.error = (action.payload as string) || 'Failed to load the project board';
        }
      })

      .addCase(createTaskThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        if (action.payload.projectId === state.boardProjectId) {
          state.tasks.push(action.payload);
        }
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to create task';
      })

      .addCase(updateTaskThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const index = state.tasks.findIndex(
          (t) => taskIdentity(t) === taskIdentity(action.payload)
        );
        if (index !== -1) state.tasks[index] = action.payload;
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to update task';
      })

      .addCase(updateTaskStatusThunk.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (t) => taskIdentity(t) === taskIdentity(action.payload)
        );
        if (index !== -1) state.tasks[index] = action.payload;
      })
      .addCase(updateTaskStatusThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to move task';
      })

      .addCase(deleteTaskThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.tasks = state.tasks.filter((t) => taskIdentity(t) !== action.payload);
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = (action.payload as string) || 'Failed to delete task';
      });
  },
});

export const { moveTaskLocally, clearTasksError, resetBoard } = tasksSlice.actions;

export default tasksSlice.reducer;
