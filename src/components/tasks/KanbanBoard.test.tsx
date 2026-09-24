import React from 'react';
import { act, render } from '@testing-library/react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanBoard } from './KanbanBoard';
import { useAppDispatch, moveTaskLocally, updateTaskStatusThunk } from '@/store';
import { Task } from '@/types';

jest.mock('@dnd-kit/core', () => ({
  DndContext: jest.fn(({ children }: { children: React.ReactNode }) => <>{children}</>),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
  closestCorners: jest.fn(),
}));
jest.mock('./KanbanColumn', () => ({ KanbanColumn: () => null }));
jest.mock('@/store', () => ({
  useAppDispatch: jest.fn(),
  moveTaskLocally: jest.fn((payload) => ({ type: 'move', payload })),
  updateTaskStatusThunk: jest.fn((payload) => ({ type: 'persist', payload })),
}));

const task: Task = {
  _id: 'a',
  projectId: 'project',
  taskKey: 'ENG-1',
  title: 'Task',
  type: 'Task',
  priority: 'Medium',
  status: 'Todo',
  order: 0,
};
const dispatch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAppDispatch).mockReturnValue(dispatch);
  dispatch.mockReturnValue({ unwrap: () => Promise.resolve() });
});

async function drag(active: string, over: string | null) {
  const props = jest.mocked(DndContext).mock.calls.at(-1)![0];
  await act(async () => {
    props.onDragEnd?.({
      active: { id: active },
      over: over === null ? null : { id: over },
    } as DragEndEvent);
  });
}

it.each([
  ['a', null],
  ['a', 'a'],
  ['missing', 'Done'],
  ['a', 'unknown'],
])('ignores cancelled or unchanged moves: %s → %s', async (active, over) => {
  render(<KanbanBoard tasks={[task]} onTaskClick={jest.fn()} />);
  await drag(active!, over);
  expect(dispatch).not.toHaveBeenCalled();
});

it('moves a card into an empty column', async () => {
  render(<KanbanBoard tasks={[task]} onTaskClick={jest.fn()} />);
  await drag('a', 'Done');
  expect(moveTaskLocally).toHaveBeenCalledWith({ taskId: 'a', status: 'Done', order: 0 });
  expect(updateTaskStatusThunk).toHaveBeenCalledWith({
    id: 'a',
    data: { status: 'Done', order: 0 },
  });
});

it('inserts before an existing card and preserves sorted order', async () => {
  const destination: Task[] = [
    { ...task, _id: undefined, id: 'b', status: 'Done', order: 4 },
    { ...task, _id: undefined, taskKey: 'c', status: 'Done', order: 2 },
  ];
  render(<KanbanBoard tasks={[task, ...destination]} onTaskClick={jest.fn()} />);
  await drag('a', 'b');
  expect(moveTaskLocally).toHaveBeenCalledWith({ taskId: 'a', status: 'Done', order: 3 });
});

it('requests a resync after persistence fails', async () => {
  dispatch.mockReturnValue({ unwrap: () => Promise.reject(new Error('Offline')) });
  const resync = jest.fn();
  render(<KanbanBoard tasks={[task]} onTaskClick={jest.fn()} onMoveFailed={resync} />);
  await drag('a', 'Done');
  expect(resync).toHaveBeenCalledTimes(1);
});

it('contains persistence failures when no resync callback is provided', async () => {
  dispatch.mockReturnValue({ unwrap: () => Promise.reject(new Error('Offline')) });
  render(<KanbanBoard tasks={[task]} onTaskClick={jest.fn()} />);
  await drag('a', 'Done');
  expect(dispatch).toHaveBeenCalledTimes(2);
});
