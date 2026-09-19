import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader Component', () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user welcome text and default fallback', () => {
    const { rerender } = render(
      <DashboardHeader
        userName="Alex"
        isLoading={false}
        isRefreshing={false}
        onRefresh={mockRefresh}
      />
    );

    expect(screen.getByText('Welcome back, Alex!')).toBeInTheDocument();
    expect(screen.getByText('Workspace Analytics')).toBeInTheDocument();
    expect(screen.getByText('Refresh Data')).toBeInTheDocument();
    expect(screen.getByText(/Manage Users/i)).toBeInTheDocument();

    rerender(<DashboardHeader isLoading={false} isRefreshing={false} onRefresh={mockRefresh} />);
    expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
  });

  it('triggers onRefresh when clicking refresh button', () => {
    render(
      <DashboardHeader
        userName="Alex"
        isLoading={false}
        isRefreshing={false}
        onRefresh={mockRefresh}
      />
    );

    const refreshBtn = screen.getByRole('button', { name: 'Refresh Data' });
    fireEvent.click(refreshBtn);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows refreshing text and disables button when isRefreshing is true', () => {
    render(
      <DashboardHeader
        userName="Alex"
        isLoading={false}
        isRefreshing={true}
        onRefresh={mockRefresh}
      />
    );

    const refreshBtn = screen.getByRole('button', { name: 'Refresh Data' });
    expect(refreshBtn).toBeDisabled();
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
  });

  it('disables refresh button when isLoading is true', () => {
    render(
      <DashboardHeader
        userName="Alex"
        isLoading={true}
        isRefreshing={false}
        onRefresh={mockRefresh}
      />
    );

    const refreshBtn = screen.getByRole('button', { name: 'Refresh Data' });
    expect(refreshBtn).toBeDisabled();
  });
});
