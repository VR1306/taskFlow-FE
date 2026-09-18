import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OfflinePage from './page';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

describe('OfflinePage Component', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
  });

  it('renders offline title, badge, and check connection button when offline', () => {
    render(<OfflinePage />);

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.badge)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.title)).toBeInTheDocument();
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.description)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ERROR_PAGES_CONSTANTS.offline.retryButtonText })
    ).toBeInTheDocument();
  });

  it('updates view when online event is dispatched', () => {
    render(<OfflinePage />);

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.restoredText)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ERROR_PAGES_CONSTANTS.offline.dashboardButtonText })
    ).toBeInTheDocument();
  });

  it('handles manual check button click', () => {
    render(<OfflinePage />);

    const checkBtn = screen.getByRole('button', {
      name: ERROR_PAGES_CONSTANTS.offline.retryButtonText,
    });
    fireEvent.click(checkBtn);

    expect(checkBtn).toBeInTheDocument();
  });
});
