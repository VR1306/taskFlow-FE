import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Table, { TableColumn } from './Table';

interface TestItem {
  id: string;
  name: string;
  role: string;
  score: number;
}

const testData: TestItem[] = [
  { id: '1', name: 'Alice', role: 'Engineer', score: 95 },
  { id: '2', name: 'Bob', role: 'Designer', score: 88 },
];

const columns: TableColumn<TestItem>[] = [
  { key: 'name', header: 'Name', align: 'left' },
  { key: 'role', header: 'Role', align: 'center' },
  {
    key: 'score',
    header: 'Score',
    align: 'right',
    render: (item) => <span data-testid={`score-${item.id}`}>{item.score}%</span>,
  },
];

describe('Table Component', () => {
  it('renders table headers and rows accurately', () => {
    render(<Table columns={columns} data={testData} ariaLabel="Test table" />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByTestId('score-1')).toHaveTextContent('95%');

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
    expect(screen.getByTestId('score-2')).toHaveTextContent('88%');
  });

  it('renders loading state with custom loading text', () => {
    render(<Table columns={columns} data={[]} isLoading={true} loadingText="Fetching users..." />);

    expect(screen.getByText('Fetching users...')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('renders default empty message when data is empty', () => {
    render(<Table columns={columns} data={[]} />);

    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });

  it('renders custom emptyState when provided', () => {
    render(
      <Table
        columns={columns}
        data={[]}
        emptyState={<div data-testid="custom-empty">Custom Empty State</div>}
      />
    );

    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
  });

  it('handles row click when onRowClick is provided', () => {
    const handleRowClick = jest.fn();
    render(<Table columns={columns} data={testData} onRowClick={handleRowClick} />);

    const aliceRow = screen.getByText('Alice').closest('tr');
    expect(aliceRow).toBeInTheDocument();
    if (aliceRow) {
      fireEvent.click(aliceRow);
      expect(handleRowClick).toHaveBeenCalledWith(testData[0]);
    }
  });

  it('uses custom keyExtractor and custom rowClassName function', () => {
    const customKeyExtractor = (item: TestItem) => `custom-${item.id}`;
    const customRowClass = (item: TestItem) => `row-${item.role.toLowerCase()}`;

    render(
      <Table
        columns={columns}
        data={testData}
        keyExtractor={customKeyExtractor}
        rowClassName={customRowClass}
      />
    );

    const engineerCell = screen.getByText('Engineer').closest('tr');
    expect(engineerCell).toHaveClass('row-engineer');
  });

  it('handles item without id or _id by falling back to index key', () => {
    const simpleData = [{ title: 'Item 1' }, { title: 'Item 2' }];
    const simpleColumns: TableColumn<{ title: string }>[] = [{ key: 'title', header: 'Title' }];

    render(<Table columns={simpleColumns} data={simpleData} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
