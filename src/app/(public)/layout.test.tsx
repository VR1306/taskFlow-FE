import React from 'react';
import { render, screen } from '@testing-library/react';
import PublicLayout from '@/app/(public)/layout';

describe('PublicLayout Component', () => {
  it('renders children inside the responsive main content container', () => {
    render(
      <PublicLayout>
        <div data-testid="auth-form-content">
          <h1>Sign In</h1>
          <p>Please enter your credentials.</p>
        </div>
      </PublicLayout>
    );

    // Verify children rendered
    const childContent = screen.getByTestId('auth-form-content');
    expect(childContent).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Please enter your credentials.')).toBeInTheDocument();

    // Verify main tag structure and responsive layout
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('w-full', 'lg:w-1/2');

    // Verify side banner is present in the layout
    const sideBanner = screen.getByRole('complementary');
    expect(sideBanner).toBeInTheDocument();
  });
});
