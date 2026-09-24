import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table } from './Table';

it('formats primitive, missing, structured, and unsupported values', () => {
  const rows = [
    { id: 1, value: null },
    { id: 2, value: undefined },
    { id: 3, value: true },
    { id: 4, value: 42 },
    { id: 5, value: { message: 'hello' } },
    { id: 6, value: Symbol('unsupported') },
  ];
  render(
    <Table columns={[{ key: 'value', header: 'Value' }]} data={rows} rowClassName="custom-row" />
  );
  expect(screen.getByText('true')).toBeInTheDocument();
  expect(screen.getByText('42')).toBeInTheDocument();
  expect(screen.getByText('{"message":"hello"}')).toBeInTheDocument();
  expect(screen.getAllByRole('cell').filter((cell) => cell.textContent === '')).toHaveLength(3);
  expect(screen.getAllByRole('row')[1]).toHaveClass('custom-row');
});
