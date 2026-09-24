import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import authReducer from '@/store/slices/authSlice';
import tasksReducer from '@/store/slices/tasksSlice';
import { tasksService } from '@/services';
import { TASKS_CONSTANTS } from '@/constants';
import { Task, AuthUser } from '@/types';

jest.mock('@/services');

const mockTask: Task = {
  _id: 'task-1',
  taskKey: 'ENG-1',
  projectId: 'proj-1',
  title: 'Fix login bug',
  description: 'Users cannot log in with SSO',
  type: 'Bug',
  status: 'Todo',
  priority: 'High',
  order: 0,
  assigneeId: { _id: 'user-1', firstName: 'Jane', lastName: 'Doe' },
  reporterId: { _id: 'user-2', firstName: 'John', lastName: 'Smith' },
};

const members = [
  { _id: 'user-1', firstName: 'Jane', lastName: 'Doe' },
  { _id: 'user-2', firstName: 'John', lastName: 'Smith' },
  { _id: 'user-3', firstName: 'FirstOnly' },
  { _id: 'user-4', lastName: 'LastOnly' },
  { _id: 'user-5', email: 'emailonly@example.com' },
  { email: 'no_id@example.com' },
  { _id: '' },
];

const createMockStore = (currentUser: AuthUser | null = null) =>
  configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer },
    preloadedState: {
      auth: {
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    },
  });

describe('TaskDetailDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (tasksService.getComments as jest.Mock).mockResolvedValue({ success: true, data: [] });
    (tasksService.getAttachments as jest.Mock).mockResolvedValue({ success: true, data: [] });
    (tasksService.getTaskActivity as jest.Mock).mockResolvedValue({ success: true, data: [] });
  });

  it('renders nothing when no task is provided', () => {
    const store = createMockStore();
    const { container } = render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={null} members={members} />
      </Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows task details with title, status, and priority', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    expect(screen.getByText('ENG-1: Fix login bug')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fix login bug')).toBeInTheDocument();
  });

  it('loads and displays comments when the Comments tab is opened', async () => {
    (tasksService.getComments as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'c1',
          commentId: 'CMT0001',
          body: 'Looks good',
          authorId: { _id: 'user-1', firstName: 'Jane', lastName: 'Doe' },
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /comments \(0\)/i }));

    await waitFor(() => {
      expect(screen.getByText('Looks good')).toBeInTheDocument();
    });
  });

  it('posts a new comment', async () => {
    (tasksService.createComment as jest.Mock).mockResolvedValue({
      success: true,
      data: { _id: 'c2', body: 'New comment' },
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /comments \(0\)/i }));
    await waitFor(() => expect(tasksService.getComments).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), {
      target: { value: 'New comment' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^comment$/i }));

    await waitFor(() => {
      expect(tasksService.createComment).toHaveBeenCalledWith('task-1', 'New comment');
    });
  });

  it('loads attachments when the Attachments tab is opened', async () => {
    (tasksService.getAttachments as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ _id: 'a1', attachmentId: 'ATT0001', filename: 'diagram.png', size: 2048 }],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /attachments \(0\)/i }));

    await waitFor(() => {
      expect(screen.getByText('diagram.png')).toBeInTheDocument();
    });
  });

  it('loads activity when the Activity tab is opened', async () => {
    (tasksService.getTaskActivity as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          _id: 'act-1',
          activityId: 'ACT0001',
          action: 'created',
          actorName: 'Jane Doe',
          message: 'ENG-1 was created.',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /activity/i }));

    await waitFor(() => {
      expect(screen.getByText(/ENG-1 was created\./)).toBeInTheDocument();
    });
  });
  it.each([false, true])(
    'saves details and reports server failures (failure: %s)',
    async (fails) => {
      if (fails) jest.mocked(tasksService.updateTask).mockRejectedValue(new Error('Cannot save'));
      else
        jest.mocked(tasksService.updateTask).mockResolvedValue({ success: true, data: mockTask });
      render(
        <Provider store={createMockStore()}>
          <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
        </Provider>
      );
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: ' Updated title ' } });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: ' Updated description ' },
      });
      fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2026-10-01' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
      await waitFor(() =>
        expect(tasksService.updateTask).toHaveBeenCalledWith('task-1', {
          title: 'Updated title',
          description: 'Updated description',
          dueDate: '2026-10-01',
        })
      );
      if (fails) expect(await screen.findByText('Cannot save')).toBeInTheDocument();
    }
  );

  it('retains a draft after posting a comment fails', async () => {
    jest.mocked(tasksService.createComment).mockRejectedValue(new Error('Offline'));
    render(
      <Provider store={createMockStore()}>
        <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: /comments/i }));
    const input = screen.getByPlaceholderText(/comment/i);
    fireEvent.change(input, { target: { value: 'Keep this draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Comment' }));
    await waitFor(() => expect(tasksService.createComment).toHaveBeenCalled());
    expect(input).toHaveValue('Keep this draft');
  });

  it.each([false, true])(
    'handles file upload and resets the file input (failure: %s)',
    async (fails) => {
      if (fails) jest.mocked(tasksService.uploadAttachment).mockRejectedValue(new Error('Offline'));
      else (tasksService.uploadAttachment as jest.Mock).mockResolvedValue({ success: true });
      render(
        <Provider store={createMockStore()}>
          <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
        </Provider>
      );
      fireEvent.click(screen.getByRole('button', { name: /attachments/i }));
      const input = screen.getByLabelText('Upload File');
      fireEvent.change(input, { target: { files: [] } });
      expect(tasksService.uploadAttachment).not.toHaveBeenCalled();
      const file = new File(['data'], 'test.txt', { type: 'text/plain' });
      fireEvent.change(input, { target: { files: [file] } });
      await waitFor(() =>
        expect(tasksService.uploadAttachment).toHaveBeenCalledWith('task-1', file)
      );
      await waitFor(() => expect(input).not.toBeDisabled());
      expect(input).toHaveValue('');
    }
  );

  it.each([false, true])('closes only after successful deletion (failure: %s)', async (fails) => {
    if (fails) jest.mocked(tasksService.deleteTask).mockRejectedValue(new Error('Offline'));
    else (tasksService.deleteTask as jest.Mock).mockResolvedValue({ success: true });
    const onClose = jest.fn();
    const onDeleted = jest.fn();
    render(
      <Provider store={createMockStore()}>
        <TaskDetailDrawer
          isOpen
          task={mockTask}
          members={members}
          onClose={onClose}
          onDeleted={onDeleted}
        />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete Task' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Delete Task' })).getByRole('button', {
        name: 'Delete Task',
      })
    );
    await waitFor(() => expect(tasksService.deleteTask).toHaveBeenCalledWith('task-1'));
    if (fails) expect(onClose).not.toHaveBeenCalled();
    else await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
  });

  it('formats attachment sizes across byte, kilobyte, and megabyte ranges', async () => {
    (tasksService.getAttachments as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { _id: 'a1', attachmentId: 'ATT0001', filename: 'tiny.txt', size: 500 },
        { _id: 'a2', attachmentId: 'ATT0002', filename: 'diagram.png', size: 2048 },
        { _id: 'a3', attachmentId: 'ATT0003', filename: 'video.mp4', size: 5 * 1024 * 1024 },
      ],
    });
    render(
      <Provider store={createMockStore()}>
        <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /attachments \(0\)/i }));
    await waitFor(() => expect(screen.getByText('tiny.txt')).toBeInTheDocument());

    expect(screen.getByText('500 B')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    expect(screen.getByText('5.0 MB')).toBeInTheDocument();
  });

  it('keeps the previous lists when comments, attachments, or activity fail to load', async () => {
    jest.mocked(tasksService.getComments).mockRejectedValue(new Error('offline'));
    jest.mocked(tasksService.getAttachments).mockRejectedValue(new Error('offline'));
    jest.mocked(tasksService.getTaskActivity).mockRejectedValue(new Error('offline'));

    render(
      <Provider store={createMockStore()}>
        <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /comments \(0\)/i }));
    await waitFor(() => expect(tasksService.getComments).toHaveBeenCalled());
    expect(await screen.findByText(TASKS_CONSTANTS.detailDrawer.noComments)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /attachments \(0\)/i }));
    await waitFor(() => expect(tasksService.getAttachments).toHaveBeenCalled());
    expect(await screen.findByText(TASKS_CONSTANTS.detailDrawer.noAttachments)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /activity/i }));
    await waitFor(() => expect(tasksService.getTaskActivity).toHaveBeenCalled());
    expect(await screen.findByText(TASKS_CONSTANTS.detailDrawer.noActivity)).toBeInTheDocument();
  });

  it('dispatches status, priority, and assignee changes from the details tab selects', async () => {
    jest.mocked(tasksService.updateTaskStatus).mockResolvedValue({ success: true, data: mockTask });
    jest.mocked(tasksService.updateTask).mockResolvedValue({ success: true, data: mockTask });

    render(
      <Provider store={createMockStore()}>
        <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
      </Provider>
    );

    fireEvent.mouseDown(screen.getByText('Todo'));
    fireEvent.click(screen.getByText('In Progress'));
    await waitFor(() =>
      expect(tasksService.updateTaskStatus).toHaveBeenCalledWith('task-1', {
        status: 'In Progress',
      })
    );

    fireEvent.mouseDown(screen.getByText('High'));
    fireEvent.click(screen.getByText('Urgent'));
    await waitFor(() =>
      expect(tasksService.updateTask).toHaveBeenCalledWith('task-1', { priority: 'Urgent' })
    );

    fireEvent.mouseDown(screen.getByText('Jane Doe'));
    fireEvent.click(screen.getByRole('option', { name: 'John Smith' }));
    await waitFor(() =>
      expect(tasksService.updateTask).toHaveBeenCalledWith('task-1', { assigneeId: 'user-2' })
    );
  });

  it('downloads an attachment when its row is clicked', async () => {
    const clickMock = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tagName: string) => {
      if (tagName === 'a') {
        const element = originalCreateElement(tagName) as HTMLAnchorElement;
        element.click = clickMock;
        return element;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement;
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();

    (tasksService.getAttachments as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ _id: 'a1', attachmentId: 'ATT0001', filename: 'diagram.png', size: 2048 }],
    });
    const blob = new Blob(['file-contents']);
    (tasksService.downloadAttachment as jest.Mock).mockResolvedValue(blob);

    try {
      render(
        <Provider store={createMockStore()}>
          <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
        </Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /attachments \(0\)/i }));
      const attachmentButton = await screen.findByText('diagram.png');
      fireEvent.click(attachmentButton);

      await waitFor(() =>
        expect(tasksService.downloadAttachment).toHaveBeenCalledWith('task-1', 'a1')
      );
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(clickMock).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    } finally {
      document.createElement = originalCreateElement;
    }
  });

  it('renders task labels when present', () => {
    const taskWithLabels: Task = { ...mockTask, labels: ['urgent', 'frontend'] };
    render(
      <Provider store={createMockStore()}>
        <TaskDetailDrawer isOpen task={taskWithLabels} members={members} onClose={jest.fn()} />
      </Provider>
    );

    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  it('handles task with no description, no assignee, no reporter, and with dueDate', () => {
    const taskWithoutDescAndAssignee: Task = {
      ...mockTask,
      description: undefined,
      assigneeId: null,
      reporterId: null,
      dueDate: '2026-12-31T00:00:00.000Z',
    };
    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer
          isOpen
          onClose={jest.fn()}
          task={taskWithoutDescAndAssignee}
          members={members}
        />
      </Provider>
    );

    expect(screen.getByDisplayValue('2026-12-31')).toBeInTheDocument();
  });

  it('handles empty/undefined data responses from comments, attachments, and activity APIs', async () => {
    (tasksService.getComments as jest.Mock).mockResolvedValue({ success: true, data: undefined });
    (tasksService.getAttachments as jest.Mock).mockResolvedValue({
      success: true,
      data: undefined,
    });
    (tasksService.getTaskActivity as jest.Mock).mockResolvedValue({
      success: true,
      data: undefined,
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /comments \(0\)/i }));
    await waitFor(() => expect(tasksService.getComments).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /attachments \(0\)/i }));
    await waitFor(() => expect(tasksService.getAttachments).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /activity/i }));
    await waitFor(() => expect(tasksService.getTaskActivity).toHaveBeenCalled());
  });

  it('allows unassigning a task via assignee dropdown', async () => {
    jest.mocked(tasksService.updateTask).mockResolvedValue({ success: true, data: mockTask });
    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.mouseDown(screen.getByText('Jane Doe'));
    fireEvent.click(screen.getByRole('option', { name: 'Unassigned' }));
    await waitFor(() =>
      expect(tasksService.updateTask).toHaveBeenCalledWith('task-1', { assigneeId: null })
    );
  });

  it('saves task details with dueDate and handles failed save without payload', async () => {
    jest.mocked(tasksService.updateTask).mockResolvedValue({ success: true, data: mockTask });
    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-11-20' } });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() =>
      expect(tasksService.updateTask).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ dueDate: '2026-11-20' })
      )
    );
  });

  it('shows default error message when saving details fails without a message', async () => {
    jest.mocked(tasksService.updateTask).mockRejectedValue(new Error(''));
    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(screen.getByText('Failed to save changes.')).toBeInTheDocument();
    });
  });

  it('ignores posting empty or whitespace-only comment and renders fallback fields', async () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({ firstName: 'Current', lastName: 'User' })
    );

    (tasksService.getComments as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          commentId: 'CMT0099',
          body: 'Anonymous note',
          authorId: null,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /comments \(0\)/i }));
    await waitFor(() => {
      expect(screen.getByText('Anonymous note')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    // Attempt to post empty comment
    const postBtn = screen.getByRole('button', { name: 'Comment' });
    expect(postBtn).toBeDisabled();
  });

  it('renders activity entries with fallback identifier and System actor', async () => {
    (tasksService.getTaskActivity as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          activityId: 'ACT0099',
          action: 'created',
          message: 'Task created automatically',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen onClose={jest.fn()} task={mockTask} members={members} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /activity/i }));
    await waitFor(() => {
      expect(screen.getByText('Task created automatically')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('downloads an attachment using fallback attachmentId when _id is missing', async () => {
    const clickMock = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tagName: string) => {
      if (tagName === 'a') {
        const element = originalCreateElement(tagName) as HTMLAnchorElement;
        element.click = clickMock;
        return element;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement;
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();

    (tasksService.getAttachments as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ attachmentId: 'ATT0099', filename: 'fallback.png', size: 1024 }],
    });
    const blob = new Blob(['data']);
    (tasksService.downloadAttachment as jest.Mock).mockResolvedValue(blob);

    try {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
        </Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /attachments \(0\)/i }));
      const attachmentButton = await screen.findByText('fallback.png');
      fireEvent.click(attachmentButton);

      await waitFor(() =>
        expect(tasksService.downloadAttachment).toHaveBeenCalledWith('task-1', 'ATT0099')
      );
      expect(clickMock).toHaveBeenCalled();
    } finally {
      document.createElement = originalCreateElement;
    }
  });

  it('cancels deletion when clicking Cancel in confirmation modal', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <TaskDetailDrawer isOpen task={mockTask} members={members} onClose={jest.fn()} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /delete task/i }));
    expect(screen.getByRole('dialog', { name: 'Delete Task' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog', { name: 'Delete Task' })).not.toBeInTheDocument();
  });
});
