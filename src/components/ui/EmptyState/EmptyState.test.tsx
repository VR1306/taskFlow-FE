import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('renders default no-data variant correctly', () => {
    render(<EmptyState />);

    expect(screen.getByText('No Records Found')).toBeInTheDocument();
    expect(
      screen.getByText('There are currently no items available in this view.')
    ).toBeInTheDocument();
  });

  it('renders search variant with custom title and description', () => {
    render(
      <EmptyState
        variant="no-search"
        title="No Matching Users"
        description="Try searching with a different keyword or removing active filters."
      />
    );

    expect(screen.getByText('No Matching Users')).toBeInTheDocument();
    expect(
      screen.getByText('Try searching with a different keyword or removing active filters.')
    ).toBeInTheDocument();
  });

  it('renders offline and network-error variants correctly', () => {
    const { rerender } = render(<EmptyState variant="offline" />);
    expect(screen.getByText('You Are Currently Offline')).toBeInTheDocument();

    rerender(<EmptyState variant="network-error" />);
    expect(screen.getByText('Network Connectivity Issue')).toBeInTheDocument();
  });

  it('triggers action and secondaryAction buttons when clicked', () => {
    const handleAction = jest.fn();
    const handleSecondary = jest.fn();

    render(
      <EmptyState
        variant="no-data"
        actionText="Create Item"
        onAction={handleAction}
        secondaryActionText="Reset View"
        onSecondaryAction={handleSecondary}
      />
    );

    const actionBtn = screen.getByRole('button', { name: 'Create Item' });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);

    const secondaryBtn = screen.getByRole('button', { name: 'Reset View' });
    fireEvent.click(secondaryBtn);
    expect(handleSecondary).toHaveBeenCalledTimes(1);
  });

  it('renders custom action element and custom icon', () => {
    render(
      <EmptyState
        icon={<span data-testid="custom-icon">Icon</span>}
        action={<button data-testid="custom-btn">Custom Action</button>}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByTestId('custom-btn')).toBeInTheDocument();
  });
});
