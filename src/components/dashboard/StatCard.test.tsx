import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard, StatCardProps } from './StatCard';

describe('StatCard Component', () => {
  it('renders title, value, subtitle, badge, and icon', () => {
    render(
      <StatCard
        title="Active Accounts"
        value={42}
        subtitle="Authorized team members"
        badgeText="Operational"
        badgeVariant="info"
        icon={<svg data-testid="stat-icon" />}
      />
    );

    expect(screen.getByText('Active Accounts')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Authorized team members')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('renders without a badge, subtitle, or icon when they are omitted', () => {
    render(<StatCard title="Total Users" value={10} />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.queryByText('Operational')).not.toBeInTheDocument();
  });

  it('falls back to the info badge style when given an unrecognized badge variant', () => {
    render(
      <StatCard
        title="Projects"
        value={5}
        badgeText="Custom"
        badgeVariant={'unknown-variant' as unknown as StatCardProps['badgeVariant']}
      />
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});
