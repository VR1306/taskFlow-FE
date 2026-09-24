import { render, screen, fireEvent } from '@testing-library/react';
import { useSortable } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

jest.mock('@dnd-kit/sortable', () => ({ useSortable: jest.fn() }));
const task: Task = {
  projectId: 'project',
  taskKey: 'ENG-1',
  title: 'Review changes',
  type: 'Task',
  priority: 'Medium',
  status: 'Todo',
  order: 0,
};

beforeEach(() => {
  jest.mocked(useSortable).mockReturnValue({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  } as unknown as ReturnType<typeof useSortable>);
});

it.each([
  {
    _id: 'database-id',
    id: 'public-id',
    assigneeId: 'member',
    labels: undefined,
    expectedId: 'database-id',
  },
  { id: 'public-id', assigneeId: null, labels: [], expectedId: 'public-id' },
  {
    assigneeId: {
      id: 'member',
      firstName: 'Jamie',
      lastName: 'Rivera',
      email: 'jamie@example.com',
    },
    labels: ['frontend', 'review', 'release', 'extra'],
    expectedId: 'ENG-1',
  },
])('resolves card identity and assignee: $expectedId', ({ expectedId, ...fields }) => {
  const onClick = jest.fn();
  const record = { ...task, ...fields };
  render(<TaskCard task={record} onClick={onClick} />);
  fireEvent.click(screen.getByRole('button', { name: /Review changes/ }));
  expect(onClick).toHaveBeenCalledWith(record);
  expect(useSortable).toHaveBeenCalledWith({ id: expectedId });
  expect(screen.queryByText('extra')).not.toBeInTheDocument();
});

it('dims the card during a drag', () => {
  jest.mocked(useSortable).mockReturnValue({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: { x: 4, y: 8, scaleX: 1, scaleY: 1 },
    transition: 'transform 100ms',
    isDragging: true,
  } as unknown as ReturnType<typeof useSortable>);
  render(<TaskCard task={task} onClick={jest.fn()} />);
  expect(screen.getByRole('button')).toHaveStyle({ opacity: '0.5' });
});
