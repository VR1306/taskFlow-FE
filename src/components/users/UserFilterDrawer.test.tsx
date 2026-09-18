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
});
