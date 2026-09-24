import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserFilterDrawer } from './UserFilterDrawer';
import { USERS_CONSTANTS } from '@/constants';

describe('UserFilterDrawer Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentFilters: {
      role: 'Admin',
      status: 'Active',
    },
    onApply: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title, description, and active filter badge', () => {
    render(<UserFilterDrawer {...defaultProps} />);

    expect(screen.getByText(USERS_CONSTANTS.filterDrawer.title)).toBeInTheDocument();
    expect(screen.getByText(USERS_CONSTANTS.filterDrawer.description)).toBeInTheDocument();
    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByText(USERS_CONSTANTS.filterDrawer.roleLabel)).toBeInTheDocument();
    expect(screen.getByText(USERS_CONSTANTS.filterDrawer.statusLabel)).toBeInTheDocument();
  });

  it('calls onApply with current selected filters and closes on submit', () => {
    render(<UserFilterDrawer {...defaultProps} />);

    const applyBtn = screen.getByRole('button', {
      name: USERS_CONSTANTS.filterDrawer.applyButtonText,
    });
    fireEvent.click(applyBtn);

    expect(defaultProps.onApply).toHaveBeenCalledWith({
      role: 'Admin',
      status: 'Active',
    });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onReset and closes on reset button click', () => {
    render(<UserFilterDrawer {...defaultProps} />);

    const resetBtn = screen.getByRole('button', {
      name: USERS_CONSTANTS.filterDrawer.resetButtonText,
    });
    fireEvent.click(resetBtn);

    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('falls back to defaults and applies undefined filters when neither currentFilters nor filters are provided', () => {
    render(
      <UserFilterDrawer
        isOpen={true}
        onClose={defaultProps.onClose}
        onApply={defaultProps.onApply}
        onReset={defaultProps.onReset}
      />
    );

    // No active filter badge should be shown since both selects default to 'all'
    expect(screen.getByText('All Roles')).toBeInTheDocument();
    expect(screen.getByText('All Status')).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', {
      name: USERS_CONSTANTS.filterDrawer.applyButtonText,
    });
    fireEvent.click(applyBtn);

    expect(defaultProps.onApply).toHaveBeenCalledWith({
      role: undefined,
      status: undefined,
    });
  });

  it('reads from the deprecated "filters" prop when "currentFilters" is not provided', () => {
    render(
      <UserFilterDrawer
        isOpen={true}
        onClose={defaultProps.onClose}
        filters={{ role: 'QA', status: 'Inactive' }}
        onApply={defaultProps.onApply}
        onReset={defaultProps.onReset}
      />
    );

    expect(screen.getByText('2 active')).toBeInTheDocument();
  });

  it('updates selected role and status when select values change', () => {
    render(
      <UserFilterDrawer
        isOpen={true}
        onClose={defaultProps.onClose}
        onApply={defaultProps.onApply}
        onReset={defaultProps.onReset}
      />
    );

    // Change role
    fireEvent.mouseDown(screen.getByText('All Roles'));
    fireEvent.click(screen.getByText('Developer'));

    // Change status
    fireEvent.mouseDown(screen.getByText('All Status'));
    fireEvent.click(screen.getByText('Active (Full Access)'));

    expect(screen.getByText('2 active')).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', {
      name: USERS_CONSTANTS.filterDrawer.applyButtonText,
    });
    fireEvent.click(applyBtn);

    expect(defaultProps.onApply).toHaveBeenCalledWith({
      role: 'Developer',
      status: 'Active',
    });
  });
});
