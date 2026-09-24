import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardSkeleton } from './DashboardSkeleton';

describe('DashboardSkeleton Component', () => {
  it('renders loading skeleton with appropriate accessibility attributes', () => {
    render(<DashboardSkeleton />);

    const skeleton = screen.getByTestId('dashboard-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(screen.getByRole('status')).toBe(skeleton);
    expect(skeleton).toHaveAttribute('aria-label', 'Loading workspace dashboard');
  });
});
