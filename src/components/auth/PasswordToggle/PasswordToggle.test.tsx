import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordToggle } from './PasswordToggle';

describe('PasswordToggle Component', () => {
  it('renders the "show" state, prevents default on mouse down, and calls onToggle when clicked', () => {
    const onToggle = jest.fn();

    render(
      <PasswordToggle
        isVisible={false}
        onToggle={onToggle}
        showLabel="Show password"
        hideLabel="Hide password"
      />
    );

    const button = screen.getByRole('button', { name: 'Show password' });
    expect(screen.getByAltText('Show password')).toBeInTheDocument();

    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(mouseDownEvent, 'preventDefault');
    fireEvent(button, mouseDownEvent);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders the "hide" state and correct icon/alt text when isVisible is true', () => {
    const onToggle = jest.fn();

    render(
      <PasswordToggle
        isVisible={true}
        onToggle={onToggle}
        showLabel="Show password"
        hideLabel="Hide password"
      />
    );

    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
    expect(screen.getByAltText('Hide password')).toBeInTheDocument();
  });
});
