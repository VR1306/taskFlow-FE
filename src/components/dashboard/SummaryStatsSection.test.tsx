import React from 'react';
import { render, screen } from '@testing-library/react';
import { SummaryStatsSection } from './SummaryStatsSection';

const mockSummary = {
  totalUsers: 25,
  activeUsers: 20,
  inactiveUsers: 5,
  totalRoles: 6,
  systemRoles: 4,
  customRoles: 2,
  activeRoles: 5,
  totalPermissions: 42,
  totalProjects: 3,
  totalTasks: 12,
};

describe('SummaryStatsSection Component', () => {
  it('renders the Active Accounts stat card alongside users, projects, roles, and permissions totals', () => {
    render(<SummaryStatsSection summary={mockSummary} />);

    expect(screen.getByText('Active Accounts')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Authorized team members')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12 tasks across the workspace')).toBeInTheDocument();
    expect(screen.getByText('Security Roles')).toBeInTheDocument();
    expect(screen.getByText('System Permissions')).toBeInTheDocument();
  });
});

it('shows zero active percentage for an empty workspace', () => {
  render(<SummaryStatsSection summary={{ ...mockSummary, totalUsers: 0, activeUsers: 0 }} />);
  expect(screen.getByText('0% Active')).toBeInTheDocument();
});
