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

  it('renders image when icon is passed as string path or iconSrc', () => {
    const { container, rerender } = render(<EmptyState icon="/icons/building.svg" />);
    // Should render an img element with src="/icons/building.svg" and NOT raw text
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(screen.queryByText('/icons/building.svg')).not.toBeInTheDocument();

    rerender(<EmptyState iconSrc="/icons/building.svg" />);
    const img2 = container.querySelector('img');
    expect(img2).toBeInTheDocument();
    expect(screen.queryByText('/icons/building.svg')).not.toBeInTheDocument();
  });

  it('falls back to the no-data variant and md size config for unknown values', () => {
    render(
      <EmptyState
        variant={'not-a-real-variant' as unknown as never}
        size={'not-a-real-size' as unknown as never}
      />
    );

    // Falls back to the 'no-data' variant defaults
    expect(screen.getByText('No Records Found')).toBeInTheDocument();
    // Falls back to the 'md' size classes on the title element
    expect(screen.getByText('No Records Found')).toHaveClass('text-base');
  });

  it('sets a generic aria-label when the title is not a plain string', () => {
    render(<EmptyState title={<span>Rich Title</span>} />);

    expect(screen.getByRole('region', { name: 'Empty state' })).toBeInTheDocument();
    expect(screen.getByText('Rich Title')).toBeInTheDocument();
  });
});
