import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import { ERROR_PAGES_CONSTANTS } from '@/constants';

describe('OfflineBanner Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders nothing when client is online and no restored event has fired', () => {
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders offline alert when window offline event is dispatched', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.title)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ERROR_PAGES_CONSTANTS.offline.retryButtonText })
    ).toBeInTheDocument();
  });

  it('renders restored notification and auto-hides after duration when online event is dispatched', () => {
    render(<OfflineBanner autoHideDurationMs={2000} />);

    // Trigger offline then online
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.title)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.restoredText)).toBeInTheDocument();

    // Fast-forward 2000ms
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(ERROR_PAGES_CONSTANTS.offline.restoredText)).not.toBeInTheDocument();
  });

  it('supports manual check button when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const checkBtn = screen.getByRole('button', {
      name: ERROR_PAGES_CONSTANTS.offline.retryButtonText,
    });
    fireEvent.click(checkBtn);

    act(() => {
      jest.advanceTimersByTime(700);
    });

    // Simulate recovery to online
    Object.defineProperty(navigator, 'onLine', { value: true });
    fireEvent.click(checkBtn);

    expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.restoredText)).toBeInTheDocument();
  });
});
