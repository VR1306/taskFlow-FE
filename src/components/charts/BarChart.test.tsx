import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarChart } from './BarChart';

describe('BarChart Component', () => {
  const mockData = [
    { label: 'Jan', value: 10, color: '#3b82f6' },
    { label: 'Feb', value: 25, color: '#3b82f6' },
    { label: 'Mar', value: 18, color: '#3b82f6' },
  ];

  it('renders bar chart with labels and title', () => {
    render(<BarChart data={mockData} title="Monthly Registrations" valueLabel="Users" />);

    expect(screen.getByText('Monthly Registrations')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText('No chart analytics available')).toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    render(<BarChart data={mockData} valueLabel="Signups" />);

    const febColumn = screen.getByTestId('bar-column-feb');
    fireEvent.mouseEnter(febColumn);

    expect(screen.getAllByText('Feb')).toHaveLength(2);
    expect(screen.getByText('25')).toBeInTheDocument();

    fireEvent.mouseLeave(febColumn);
  });

  it('renders secondary series comparison bars properly', () => {
    const multiData = [
      { label: 'Admin', value: 20, secondaryValue: 5, color: '#3b82f6', secondaryColor: '#10b981' },
    ];

    render(
      <BarChart
        data={multiData}
        title="Permissions vs Users"
        valueLabel="Permissions"
        secondaryLabel="Users"
      />
    );

    expect(screen.getByText('Permissions vs Users')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});

it.each([
  { value: 3, ceiling: 5 },
  { value: 8, ceiling: 10 },
  { value: 17, ceiling: 20 },
  { value: 40, ceiling: 50 },
  { value: 75, ceiling: 100 },
  { value: 230, ceiling: 300 },
])('scales the axis to $ceiling for $value', ({ value, ceiling }) => {
  render(<BarChart data={[{ label: 'Current', value }]} showGrid={false} />);
  expect(screen.getByText(String(ceiling))).toBeInTheDocument();
});

it('supports mixed series and default secondary labels on hover', () => {
  render(
    <BarChart
      data={[
        { label: 'First', value: 2, secondaryValue: 0, secondaryColor: '#ff0000' },
        { label: 'Second', value: 4, secondaryValue: 3 },
        { label: 'Third', value: 1 },
      ]}
    />
  );
  fireEvent.mouseEnter(screen.getByTestId('bar-column-first'));
  expect(screen.getByText(/Secondary:/)).toBeInTheDocument();
  fireEvent.mouseLeave(screen.getByTestId('bar-column-first'));
  expect(screen.queryByText(/Secondary:/)).not.toBeInTheDocument();
  fireEvent.mouseEnter(screen.getByTestId('bar-column-third'));
  expect(screen.queryByText(/Secondary:/)).not.toBeInTheDocument();
});
