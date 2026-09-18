import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './error';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

describe('ErrorBoundary 500 Component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders error title, message, and action buttons', () => {
    const mockReset = jest.fn();
    const testError = Object.assign(new Error('Failed to load records from backend'), {
      digest: 'ERR_12345',
    });

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.serverError.badge)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.serverError.title)).toBeInTheDocument();
    expect(screen.getByText('Failed to load records from backend')).toBeInTheDocument();
    expect(screen.getByText('Error Reference: ERR_12345')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', {
      name: ERROR_PAGES_CONSTANTS.serverError.retryButtonText,
    });
    fireEvent.click(retryBtn);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
