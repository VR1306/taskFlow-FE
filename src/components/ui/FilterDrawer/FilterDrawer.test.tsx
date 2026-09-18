import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterDrawer } from './FilterDrawer';

describe('FilterDrawer Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onApply: jest.fn(),
    onReset: jest.fn(),
    title: 'Filter Team Members',
    description: 'Filter users by assigned role or account status.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title, description, and children when open', () => {
    render(
      <FilterDrawer {...defaultProps} activeFilterCount={2}>
        <div data-testid="filter-child-field">Role Selector</div>
      </FilterDrawer>
    );

    expect(screen.getByText('Filter Team Members')).toBeInTheDocument();
    expect(
      screen.getByText('Filter users by assigned role or account status.')
    ).toBeInTheDocument();
    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByTestId('filter-child-field')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument();
  });

  it('triggers onApply when Apply Filters button is clicked', () => {
    render(
      <FilterDrawer {...defaultProps}>
        <div>Fields</div>
      </FilterDrawer>
    );

    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyButton);

    expect(defaultProps.onApply).toHaveBeenCalledTimes(1);
  });

  it('triggers onReset when Reset Filters button is clicked', () => {
    render(
      <FilterDrawer {...defaultProps}>
        <div>Fields</div>
      </FilterDrawer>
    );

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);

    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when close button is clicked', () => {
    render(
      <FilterDrawer {...defaultProps}>
        <div>Fields</div>
      </FilterDrawer>
    );

    const closeButton = screen.getByRole('button', { name: 'Close drawer' });
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows loader state when isLoading is true', () => {
    render(
      <FilterDrawer {...defaultProps} isLoading={true}>
        <div>Fields</div>
      </FilterDrawer>
    );

    expect(screen.getByRole('button', { name: /reset filters/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /apply filters/i })).toBeDisabled();
  });
});
