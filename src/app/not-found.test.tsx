import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from './not-found';
import { useRouter } from 'next/navigation';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('NotFound 404 Page', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  it('renders 404 badge, title, description, and navigation links', () => {
    render(<NotFound />);

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.notFound.badge)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.notFound.title)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.notFound.description)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ERROR_PAGES_CONSTANTS.notFound.dashboardButtonText })
    ).toBeInTheDocument();
  });

  it('triggers router.back when clicking Go Back button', () => {
    render(<NotFound />);

    const backBtn = screen.getByRole('button', {
      name: ERROR_PAGES_CONSTANTS.notFound.backButtonText,
    });
    fireEvent.click(backBtn);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
