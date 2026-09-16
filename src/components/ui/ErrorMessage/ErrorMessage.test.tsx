import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

describe('ErrorMessage Component', () => {
  it('renders nothing when message is empty or undefined', () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message with alert role and error text', () => {
    render(<ErrorMessage message="Invalid email address" id="email-error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('id', 'email-error');
    expect(alert).toHaveTextContent('Invalid email address');
  });
});
