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
  });

  it('renders different positions correctly', () => {
    const { rerender } = render(
      <Tooltip content="Bottom tip" position="bottom">
        <button type="button">Position test</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Position test' });
    fireEvent.mouseEnter(button);
    expect(screen.getByRole('tooltip')).toHaveClass('top-full');

    rerender(
      <Tooltip content="Left tip" position="left">
        <button type="button">Position test</button>
      </Tooltip>
    );
    expect(screen.getByRole('tooltip')).toHaveClass('right-full');
  });
});
