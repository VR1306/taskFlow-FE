import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessDenied } from './AccessDenied';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('AccessDenied Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title, description, and action buttons', () => {
    render(<AccessDenied />);

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.accessDenied.title)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.accessDenied.description)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.accessDenied.badge)).toBeInTheDocument();

    const backButton = screen.getByRole('button', {
      name: new RegExp(ERROR_PAGES_CONSTANTS.accessDenied.backButtonText, 'i'),
    });
    expect(backButton).toBeInTheDocument();

    const dashboardButton = screen.getByRole('button', {
      name: new RegExp(ERROR_PAGES_CONSTANTS.accessDenied.dashboardButtonText, 'i'),
    });
    expect(dashboardButton).toBeInTheDocument();

    const dashboardLink = screen.getByRole('link');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('navigates back when the back button is clicked', () => {
    render(<AccessDenied />);

    const backButton = screen.getByRole('button', {
      name: new RegExp(ERROR_PAGES_CONSTANTS.accessDenied.backButtonText, 'i'),
    });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
