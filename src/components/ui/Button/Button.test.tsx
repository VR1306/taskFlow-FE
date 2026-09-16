import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders button with children and default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading spinner and loadingText when isLoading is true', () => {
    render(
      <Button isLoading loadingText="Saving...">
        Save
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Saving...');
  });

  it('renders disabled state properly', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test.each([
    { variant: 'primary' as const, expectedClass: 'bg-blue-600' },
    { variant: 'secondary' as const, expectedClass: 'bg-slate-100' },
    { variant: 'outline' as const, expectedClass: 'border-blue-600' },
    { variant: 'ghost' as const, expectedClass: 'text-blue-600' },
  ])('renders $variant variant with correct styles', ({ variant, expectedClass }) => {
    render(<Button variant={variant}>{variant}</Button>);
    const button = screen.getByRole('button', { name: new RegExp(variant, 'i') });
    expect(button.className).toContain(expectedClass);
  });
});
