import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { useDropdownMenu } from './useDropdownMenu';

function Menu() {
  const { isOpen, coords, triggerRef, menuRef, handleToggle, handleClose } = useDropdownMenu();
  return (
    <>
      <button ref={triggerRef} onClick={handleToggle}>
        Toggle
      </button>
      {isOpen && (
        <div ref={menuRef} data-testid="menu" style={{ top: coords?.top, left: coords?.left }}>
          <button onClick={handleClose}>Close</button>
        </div>
      )}
    </>
  );
}

afterEach(() => jest.restoreAllMocks());

it.each(['Escape', 'scroll', 'resize', 'outside', 'Close', 'Toggle'])(
  'dismisses an open menu via %s',
  (event) => {
    render(<Menu />);
    fireEvent.click(screen.getByText('Toggle'));
    fireEvent.mouseDown(screen.getByTestId('menu'));
    fireEvent.mouseDown(screen.getByText('Toggle'));
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    if (event === 'Escape') fireEvent.keyDown(document, { key: event });
    else if (event === 'scroll') fireEvent.scroll(window);
    else if (event === 'resize') fireEvent.resize(window);
    else if (event === 'outside') fireEvent.mouseDown(document.body);
    else fireEvent.click(screen.getByText(event));
    expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
  }
);

it('positions a menu above its trigger and within the right edge of the viewport', () => {
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 700,
    bottom: 740,
    right: 1100,
    left: 1060,
    width: 40,
    height: 40,
    x: 1060,
    y: 700,
    toJSON: () => ({}),
  });
  render(<Menu />);
  fireEvent.click(screen.getByText('Toggle'));
  expect(screen.getByTestId('menu')).toHaveStyle({
    top: '556px',
    left: `${window.innerWidth - 190}px`,
  });
});

it('handles toggling before a trigger is mounted', () => {
  const { result } = renderHook(() => useDropdownMenu());
  act(() => result.current.handleToggle());
  expect(result.current.isOpen).toBe(true);
  expect(result.current.coords).toBeNull();
});
