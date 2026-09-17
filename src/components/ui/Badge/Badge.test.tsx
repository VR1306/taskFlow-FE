import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge Component', () => {
  it('renders children and default classes', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-100');
  });

  it('renders variants and sizes', () => {
    const { rerender } = render(
      <Badge variant="primary" size="sm">
        Admin
      </Badge>
    );
    let badge = screen.getByText('Admin');
    expect(badge).toHaveClass('bg-blue-50');
    expect(badge).toHaveClass('text-[11px]');

    rerender(
      <Badge variant="success" size="md">
        Active
      </Badge>
    );
    badge = screen.getByText('Active');
    expect(badge).toHaveClass('bg-emerald-50');

    rerender(<Badge variant="danger">Failed</Badge>);
    badge = screen.getByText('Failed');
    expect(badge).toHaveClass('bg-rose-50');

    rerender(<Badge variant="purple">SuperAdmin</Badge>);
    badge = screen.getByText('SuperAdmin');
    expect(badge).toHaveClass('bg-purple-50');

    rerender(<Badge variant="warning">Pending</Badge>);
    badge = screen.getByText('Pending');
    expect(badge).toHaveClass('bg-amber-50');

    rerender(<Badge variant="info">Info</Badge>);
    badge = screen.getByText('Info');
    expect(badge).toHaveClass('bg-sky-50');
  });
});
