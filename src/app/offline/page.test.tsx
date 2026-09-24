import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
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

it('finishes a manual connection check and responds to disconnects', () => {
  jest.useFakeTimers();
  Object.defineProperty(navigator, 'onLine', { value: false });
  const { unmount } = render(<OfflinePage />);
  fireEvent.click(
    screen.getByRole('button', { name: ERROR_PAGES_CONSTANTS.offline.retryButtonText })
  );
  act(() => {
    jest.advanceTimersByTime(700);
  });
  expect(
    screen.getByRole('button', { name: ERROR_PAGES_CONSTANTS.offline.retryButtonText })
  ).toBeEnabled();
  act(() => {
    window.dispatchEvent(new Event('offline'));
  });
  expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.title)).toBeInTheDocument();
  unmount();
  jest.useRealTimers();
});

it('uses the "online" server snapshot when rendered on the server (SSR)', () => {
  const html = renderToString(<OfflinePage />);

  expect(html).toContain(ERROR_PAGES_CONSTANTS.offline.restoredText);
  expect(html).toContain(ERROR_PAGES_CONSTANTS.offline.dashboardButtonText);
});

it('treats the connection as online when navigator is unavailable', () => {
  const originalNavigator = global.navigator;
  // @ts-expect-error - simulating an environment without a navigator global
  delete global.navigator;

  render(<OfflinePage />);
  expect(screen.getByText(ERROR_PAGES_CONSTANTS.offline.restoredText)).toBeInTheDocument();

  Object.defineProperty(global, 'navigator', {
    value: originalNavigator,
    configurable: true,
    writable: true,
  });
});
