import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PieChart } from './PieChart';

describe('PieChart Component', () => {
  const mockData = [
    { label: 'Super Admin', count: 3, percentage: 30, color: '#6366f1' },
    { label: 'Admin', count: 7, percentage: 70, color: '#3b82f6' },
  ];

  it('renders pie chart with slices and legend', () => {
    render(<PieChart data={mockData} title="Role Breakdown" totalLabel="Members" />);

    expect(screen.getByText('Role Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // total = 3 + 7
  });

  it('renders empty state when data is empty or sum is 0', () => {
    const { rerender } = render(<PieChart data={[]} />);
    expect(screen.getByText('No distribution data available')).toBeInTheDocument();

    rerender(<PieChart data={[{ label: 'None', count: 0, color: '#ccc' }]} />);
    expect(screen.getByText('No distribution data available')).toBeInTheDocument();
  });

  it('handles mouse hover interactions on slices and legend buttons', () => {
    render(<PieChart data={mockData} />);

    const superAdminSlice = screen.getByTestId('pie-slice-super-admin');
    fireEvent.mouseEnter(superAdminSlice);
    expect(screen.getByText('30%')).toBeInTheDocument();

    fireEvent.mouseLeave(superAdminSlice);
    expect(screen.getByText('10')).toBeInTheDocument();

    // Hover via legend button
    const adminLegendBtn = screen.getByText('Admin').closest('button');
    if (adminLegendBtn) {
      fireEvent.mouseEnter(adminLegendBtn);
      expect(screen.getByText('70%')).toBeInTheDocument();
      fireEvent.mouseLeave(adminLegendBtn);
    }
  });

  it('renders single 100% full circle slice properly', () => {
    render(<PieChart data={[{ label: 'All Users', count: 5, color: '#10b981' }]} />);
    expect(screen.getByText('All Users')).toBeInTheDocument();
    expect(screen.getAllByText('5')).toHaveLength(2);
  });
});
