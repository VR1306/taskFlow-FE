import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, Middleware } from '@reduxjs/toolkit';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { KanbanBoard, computeInsertionOrder } from './KanbanBoard';
import { CreateTaskDrawer } from './CreateTaskDrawer';
import { TaskFilterDrawer, TaskFiltersState } from './TaskFilterDrawer';
import authReducer from '@/store/slices/authSlice';
import tasksReducer from '@/store/slices/tasksSlice';
import { tasksService } from '@/services';
import { TASKS_CONSTANTS } from '@/constants';
import { Task } from '@/types';

jest.mock('@/services');
jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');
  return {
    ...actual,
    useDroppable: jest.fn(() => ({ setNodeRef: jest.fn(), isOver: false })),
  };
});

const mockTask: Task = {
  _id: 'task-1',
  taskKey: 'ENG-1',
  projectId: 'proj-1',
  title: 'Fix login bug',
  type: 'Bug',
  status: 'Todo',
  priority: 'High',
  order: 0,
  labels: ['urgent'],
};

const createMockStore = () =>
  configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer },
  });

describe('Task Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TaskCard', () => {
    it('renders task key, title, type, priority, and labels', () => {
      render(
        <DndContext>
          <TaskCard task={mockTask} onClick={jest.fn()} />
        </DndContext>
      );

      expect(screen.getByText('ENG-1')).toBeInTheDocument();
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.getByText('Bug')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    it('calls onClick with the task when clicked', () => {
      const handleClick = jest.fn();
      render(
        <DndContext>
          <TaskCard task={mockTask} onClick={handleClick} />
        </DndContext>
      );

      fireEvent.click(screen.getByText('Fix login bug'));
      expect(handleClick).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('KanbanBoard', () => {
    it('renders all four status columns with the correct task counts', () => {
      const secondTask: Task = {
        ...mockTask,
        _id: 'task-2',
        taskKey: 'ENG-2',
        status: 'Done',
        order: 0,
      };
      const store = createMockStore();

      render(
        <Provider store={store}>
          <KanbanBoard tasks={[mockTask, secondTask]} onTaskClick={jest.fn()} />
        </Provider>
      );

      expect(screen.getByText('Todo')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('In Review')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('ENG-1')).toBeInTheDocument();
      expect(screen.getByText('ENG-2')).toBeInTheDocument();
    });

    it('renders an empty-column message for columns with no tasks', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <KanbanBoard tasks={[mockTask]} onTaskClick={jest.fn()} />
        </Provider>
      );

      expect(screen.getAllByText('No tasks')).toHaveLength(3);
    });

    it('resolves task identity through id and taskKey fallbacks in each column', () => {
      const idOnlyTask: Task = {
        ...mockTask,
        _id: undefined,
        id: 'fallback-id',
        taskKey: 'ENG-9',
        status: 'In Review',
        order: 0,
      };
      const taskKeyOnlyTask: Task = {
        ...mockTask,
        _id: undefined,
        id: undefined,
        taskKey: 'ENG-10',
        status: 'In Review',
        order: 1,
      };
      const store = createMockStore();
      render(
        <Provider store={store}>
          <KanbanBoard tasks={[idOnlyTask, taskKeyOnlyTask]} onTaskClick={jest.fn()} />
        </Provider>
      );

      expect(screen.getByText('ENG-9')).toBeInTheDocument();
      expect(screen.getByText('ENG-10')).toBeInTheDocument();
    });

    it('applies drop-target styling to a column reported as hovered', () => {
      jest
        .mocked(useDroppable)
        .mockImplementation(
          ({ id }) =>
            ({ setNodeRef: jest.fn(), isOver: id === 'In Progress' }) as unknown as ReturnType<
              typeof useDroppable
            >
        );

      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <KanbanBoard tasks={[mockTask]} onTaskClick={jest.fn()} />
        </Provider>
      );

      expect(container.querySelector('.border-blue-300')).toBeInTheDocument();

      jest
        .mocked(useDroppable)
        .mockImplementation(
          () =>
            ({ setNodeRef: jest.fn(), isOver: false }) as unknown as ReturnType<typeof useDroppable>
        );
    });
  });

  describe('computeInsertionOrder', () => {
    it('returns 0 when the destination column is empty', () => {
      expect(computeInsertionOrder([], 0)).toBe(0);
    });

    it('returns one less than the first task when inserting at the start', () => {
      const tasks = [{ ...mockTask, order: 5 }];
      expect(computeInsertionOrder(tasks, 0)).toBe(4);
    });

    it('returns one more than the last task when appending at the end', () => {
      const tasks = [{ ...mockTask, order: 2 }];
      expect(computeInsertionOrder(tasks, 1)).toBe(3);
    });

    it('returns the midpoint when inserting between two tasks', () => {
      const tasks = [
        { ...mockTask, order: 2 },
        { ...mockTask, _id: 'task-2', order: 4 },
      ];
      expect(computeInsertionOrder(tasks, 1)).toBe(3);
    });
  });

  describe('CreateTaskDrawer', () => {
    it('shows a validation error when submitting without a title', async () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <CreateTaskDrawer isOpen onClose={jest.fn()} projectId="proj-1" members={[]} />
        </Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /create task/i }));
      await waitFor(() => {
        expect(screen.getByText('Task title is required')).toBeInTheDocument();
      });
    });

    it('creates a task with the entered title', async () => {
      (tasksService.createTask as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockTask, title: 'New task' },
      });
      const store = createMockStore();
      const handleClose = jest.fn();
      const handleSuccess = jest.fn();

      render(
        <Provider store={store}>
          <CreateTaskDrawer
            isOpen
            onClose={handleClose}
            projectId="proj-1"
            members={[]}
            onSuccess={handleSuccess}
          />
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText(/fix broken checkout flow/i), {
        target: { value: 'New task' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(tasksService.createTask).toHaveBeenCalledWith(
          expect.objectContaining({ projectId: 'proj-1', title: 'New task' })
        );
        expect(handleClose).toHaveBeenCalled();
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('builds assignee options from members using id and label fallbacks', () => {
      const store = createMockStore();
      const membersList = [
        { _id: 'm1', firstName: 'Jane', lastName: 'Doe' },
        { id: 'm2', email: 'solo@example.com' },
        { email: 'anon@example.com' },
        { _id: 'm4' },
      ];

      render(
        <Provider store={store}>
          <CreateTaskDrawer isOpen onClose={jest.fn()} projectId="proj-1" members={membersList} />
        </Provider>
      );

      fireEvent.mouseDown(screen.getByText('Unassigned'));
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('solo@example.com')).toBeInTheDocument();
      expect(screen.getByText('anon@example.com')).toBeInTheDocument();
      expect(screen.getByText('Unnamed')).toBeInTheDocument();
    });

    it('adds labels on Enter, ignores duplicates and blanks, and removes labels', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <CreateTaskDrawer isOpen onClose={jest.fn()} projectId="proj-1" members={[]} />
        </Provider>
      );
      const labelsInput = screen.getByPlaceholderText(/type a label and press enter/i);

      fireEvent.change(labelsInput, { target: { value: 'urgent' } });
      fireEvent.keyDown(labelsInput, { key: 'Enter' });
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(labelsInput).toHaveValue('');

      // Duplicate label text is not added again.
      fireEvent.change(labelsInput, { target: { value: 'urgent' } });
      fireEvent.keyDown(labelsInput, { key: 'Enter' });
      expect(screen.getAllByText('urgent')).toHaveLength(1);

      // Whitespace-only input is a no-op.
      fireEvent.change(labelsInput, { target: { value: '   ' } });
      fireEvent.keyDown(labelsInput, { key: 'Enter' });
      expect(screen.getAllByText('urgent')).toHaveLength(1);

      // Non-Enter keys are a no-op.
      fireEvent.change(labelsInput, { target: { value: 'frontend' } });
      fireEvent.keyDown(labelsInput, { key: 'a' });
      expect(screen.queryByText('frontend')).not.toBeInTheDocument();

      fireEvent.keyDown(labelsInput, { key: 'Enter' });
      expect(screen.getByText('frontend')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Remove label urgent' }));
      expect(screen.queryByText('urgent')).not.toBeInTheDocument();
      expect(screen.getByText('frontend')).toBeInTheDocument();
    });

    it.each([
      ['Duplicate title', 'Duplicate title'],
      ['', TASKS_CONSTANTS.createDrawer.defaultError],
    ])(
      'shows the server error message when task creation is rejected (%s)',
      async (rejectMessage, expectedText) => {
        (tasksService.createTask as jest.Mock).mockRejectedValue(new Error(rejectMessage));
        const store = createMockStore();
        render(
          <Provider store={store}>
            <CreateTaskDrawer isOpen onClose={jest.fn()} projectId="proj-1" members={[]} />
          </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText(/fix broken checkout flow/i), {
          target: { value: 'New task' },
        });
        fireEvent.click(screen.getByRole('button', { name: /create task/i }));

        await waitFor(() => {
          expect(screen.getByText(expectedText)).toBeInTheDocument();
        });
      }
    );

    it.each([
      [new Error('Boom'), 'Boom'],
      ['plain string failure', 'An error occurred'],
    ])(
      'handles errors thrown while dispatching the create task action (%p)',
      async (thrown, expectedText) => {
        const throwingMiddleware: Middleware = () => () => () => {
          throw thrown;
        };
        const store = configureStore({
          reducer: { auth: authReducer, tasks: tasksReducer },
          middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(throwingMiddleware),
        });

        render(
          <Provider store={store}>
            <CreateTaskDrawer isOpen onClose={jest.fn()} projectId="proj-1" members={[]} />
          </Provider>
        );

        fireEvent.change(screen.getByPlaceholderText(/fix broken checkout flow/i), {
          target: { value: 'New task' },
        });
        fireEvent.click(screen.getByRole('button', { name: /create task/i }));

        await waitFor(() => {
          expect(screen.getByText(expectedText)).toBeInTheDocument();
        });
      }
    );

    it('updates description, type, priority, and due date on form fields', async () => {
      (tasksService.createTask as jest.Mock).mockResolvedValue({ success: true, data: mockTask });
      const store = createMockStore();
      const onClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateTaskDrawer
            isOpen
            onClose={onClose}
            projectId="proj-1"
            members={[{ _id: 'm1', firstName: 'Jane', lastName: 'Doe' }]}
          />
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText(/fix broken checkout flow/i), {
        target: { value: 'Complete task' },
      });
      fireEvent.change(screen.getByPlaceholderText(/add more context about this task/i), {
        target: { value: 'Detailed description' },
      });

      // Type select
      fireEvent.mouseDown(screen.getByText('Task'));
      fireEvent.click(screen.getByText('Bug'));

      // Priority select
      fireEvent.mouseDown(screen.getByText('Medium'));
      fireEvent.click(screen.getByText('Urgent'));

      // Assignee select
      fireEvent.mouseDown(screen.getByText('Unassigned'));
      fireEvent.click(screen.getByText('Jane Doe'));

      // Due date
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2026-12-31' } });

      fireEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('TaskFilterDrawer', () => {
    it('renders filter selects and calls onApply', () => {
      const filters: TaskFiltersState = { assigneeId: 'all', priority: 'all', type: 'all' };
      const handleApply = jest.fn();

      render(
        <TaskFilterDrawer
          isOpen
          onClose={jest.fn()}
          filters={filters}
          onChange={jest.fn()}
          onApply={handleApply}
          onReset={jest.fn()}
          members={[]}
        />
      );

      expect(screen.getByText('Filter Tasks')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
      expect(handleApply).toHaveBeenCalled();
    });

    it('builds assignee filter options from members using id and label fallbacks', () => {
      const filters: TaskFiltersState = { assigneeId: 'all', priority: 'all', type: 'all' };
      const membersList = [
        { _id: 'm1', firstName: 'Jane', lastName: 'Doe' },
        { id: 'm2', email: 'solo@example.com' },
        { email: 'anon@example.com' },
        { _id: 'm4' },
      ];

      render(
        <TaskFilterDrawer
          isOpen
          onClose={jest.fn()}
          filters={filters}
          onChange={jest.fn()}
          onApply={jest.fn()}
          onReset={jest.fn()}
          members={membersList}
        />
      );

      fireEvent.mouseDown(screen.getByText('All Assignees'));
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('solo@example.com')).toBeInTheDocument();
      expect(screen.getByText('anon@example.com')).toBeInTheDocument();
      expect(screen.getByText('Unnamed')).toBeInTheDocument();
    });

    it('calls onChange when selecting assignee, priority, or type', () => {
      const filters: TaskFiltersState = { assigneeId: 'all', priority: 'all', type: 'all' };
      const handleChange = jest.fn();
      const membersList = [{ _id: 'm1', firstName: 'Jane', lastName: 'Doe' }];

      render(
        <TaskFilterDrawer
          isOpen
          onClose={jest.fn()}
          filters={filters}
          onChange={handleChange}
          onApply={jest.fn()}
          onReset={jest.fn()}
          members={membersList}
        />
      );

      // Change assignee
      fireEvent.mouseDown(screen.getByText('All Assignees'));
      fireEvent.click(screen.getByText('Jane Doe'));
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ assigneeId: 'm1' }));

      // Change priority
      fireEvent.mouseDown(screen.getByText('All Priorities'));
      fireEvent.click(screen.getByText('Urgent'));
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ priority: 'Urgent' }));

      // Change type
      fireEvent.mouseDown(screen.getByText('All Types'));
      fireEvent.click(screen.getByText('Bug'));
      expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'Bug' }));
    });
  });
});
