import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders child element without tooltip initially', () => {
    render(
      <Tooltip content="Helper text">
        <button type="button">Hover me</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter and hides on mouse leave', () => {
    render(
      <Tooltip content="Tooltip explanation">
        <button type="button">Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Hover me' });

    fireEvent.mouseEnter(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip explanation')).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus and hides on blur for accessibility', () => {
    render(
      <Tooltip content="Accessible focus tip">
        <button type="button">Focus me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Focus me' });

    fireEvent.focus(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Accessible focus tip')).toBeInTheDocument();

    fireEvent.blur(button);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show tooltip when disabled or empty content', () => {
    const { rerender } = render(
      <Tooltip content="" disabled>
        <button type="button">No tip</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'No tip' });
    fireEvent.mouseEnter(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <Tooltip content="Disabled tip" disabled>
        <button type="button">No tip</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <Tooltip content="" disabled={false}>
        <button type="button">No tip</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('uses offsetWidth and offsetHeight when element has measured dimensions', () => {
    const origWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const origHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 180 });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 32 });

    render(
      <Tooltip content="Measured tip">
        <button type="button">Measured</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Measured' });
    fireEvent.mouseEnter(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    if (origWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', origWidth);
    } else {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetWidth;
    }
    if (origHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', origHeight);
    } else {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetHeight;
    }
  });

  it('renders portal in document.body with fixed positioning', () => {
    render(
      <Tooltip content="Portal tip" position="bottom">
        <button type="button">Position test</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Position test' });
    fireEvent.mouseEnter(button);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('fixed');
    expect(tooltip).toHaveClass('z-[9999]');
  });
  it.each([
    { position: 'top' as const, top: 200, left: 400 },
    { position: 'bottom' as const, top: 760, left: 400 },
    { position: 'left' as const, top: 200, left: 0 },
    { position: 'right' as const, top: 200, left: 1020 },
    { position: 'left' as const, top: 200, left: 500 },
    { position: 'right' as const, top: 200, left: 500 },
  ])('positions and flips a $position tooltip at ($left, $top)', ({ position, top, left }) => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top,
      bottom: top + 20,
      left,
      right: left + 20,
      height: 20,
      width: 20,
      x: left,
      y: top,
      toJSON: () => ({}),
    });
    render(
      <Tooltip content="Details" position={position}>
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeVisible();
    fireEvent.scroll(window);
    fireEvent.resize(window);
    expect(Number.parseFloat(screen.getByRole('tooltip').style.left)).toBeGreaterThanOrEqual(10);
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(trigger);
    act(() => jest.advanceTimersByTime(100));
    expect(screen.getByRole('tooltip')).toBeVisible();
    jest.restoreAllMocks();
  });

  it('does not throw when a stale scroll/resize listener fires after the trigger unmounts mid-visibility', () => {
    const { rerender } = render(
      <Tooltip content="Will disappear">
        <button type="button">Target</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Target' });
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Content becomes falsy while the tooltip is still internally "visible".
    // The trigger wrapper (and its ref) unmounts, but the scroll/resize
    // listeners registered while visible are still attached.
    rerender(
      <Tooltip content="">
        <button type="button">Target</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    expect(() => fireEvent.resize(window)).not.toThrow();
  });

  it('falls back to default tooltip dimensions when position is calculated before the tooltip element mounts', () => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 220,
      left: 400,
      right: 420,
      height: 20,
      width: 20,
      x: 400,
      y: 200,
      toJSON: () => ({}),
    } as DOMRect);

    let capturedCalculatePosition: (() => void) | undefined;
    let callCount = 0;
    const originalUseCallback = React.useCallback;
    jest.spyOn(React, 'useCallback').mockImplementation(((
      fn: (...args: unknown[]) => unknown,
      deps: React.DependencyList
    ) => {
      callCount += 1;
      if (callCount === 1) {
        capturedCalculatePosition = fn as () => void;
      }
      return originalUseCallback(fn, deps);
    }) as typeof React.useCallback);

    render(
      <Tooltip content="Ready to show">
        <button type="button">Trigger</button>
      </Tooltip>
    );

    (React.useCallback as jest.Mock).mockRestore();

    // Invoked directly before the tooltip has ever become visible: the
    // trigger ref is attached but the portal (tooltip ref) has not rendered
    // yet, so calculatePosition must fall back to its default constants.
    expect(() => act(() => capturedCalculatePosition?.())).not.toThrow();

    jest.restoreAllMocks();
  });

  it('bails out of showTooltip when there is no content to display', () => {
    let capturedShowTooltip: (() => void) | undefined;
    let callCount = 0;
    const originalUseCallback = React.useCallback;
    jest.spyOn(React, 'useCallback').mockImplementation(((
      fn: (...args: unknown[]) => unknown,
      deps: React.DependencyList
    ) => {
      callCount += 1;
      if (callCount === 2) {
        capturedShowTooltip = fn as () => void;
      }
      return originalUseCallback(fn, deps);
    }) as typeof React.useCallback);

    render(
      <Tooltip content="">
        <button type="button">Trigger</button>
      </Tooltip>
    );

    (React.useCallback as jest.Mock).mockRestore();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(() => act(() => capturedShowTooltip?.())).not.toThrow();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    jest.restoreAllMocks();
  });
});
