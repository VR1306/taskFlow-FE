import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from './global-error';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

describe('GlobalError Root Component', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders critical error message and calls reset on button click', () => {
    const mockReset = jest.fn();
    const testError = Object.assign(new Error('Fatal Root Exception'), { digest: 'FATAL_01' });

    render(<GlobalError error={testError} reset={mockReset} />);

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.globalError.badge)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.globalError.title)).toBeInTheDocument();
    expect(screen.getByText('Fatal Root Exception')).toBeInTheDocument();

    const reloadBtn = screen.getByRole('button', {
      name: ERROR_PAGES_CONSTANTS.globalError.reloadButtonText,
    });
    fireEvent.click(reloadBtn);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
