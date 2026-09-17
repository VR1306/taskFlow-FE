import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PublicLayout from '@/app/(public)/layout';
import { authStorage } from '@/helpers';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

describe('PublicLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStorage.clearAuthSession();
    localStorage.clear();
  });

  it('renders children inside the responsive main content container when unauthenticated', async () => {
    render(
      <PublicLayout>
        <div data-testid="auth-form-content">
          <h1>Sign In</h1>
          <p>Please enter your credentials.</p>
        </div>
      </PublicLayout>
    );

    // Verify children rendered
    await waitFor(() => {
      const childContent = screen.getByTestId('auth-form-content');
      expect(childContent).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Please enter your credentials.')).toBeInTheDocument();
    });

    // Verify main tag structure and responsive layout
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('w-full', 'lg:w-1/2');

    // Verify side banner is present in the layout
    const sideBanner = screen.getByRole('complementary');
    expect(sideBanner).toBeInTheDocument();
  });

  it('redirects authenticated user to default module with router.replace', async () => {
    authStorage.setTokens('valid-jwt-token');
    localStorage.setItem('taskflow_default_module', 'users');

    render(
      <PublicLayout>
        <div data-testid="auth-form-content">
          <h1>Sign In</h1>
        </div>
      </PublicLayout>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/users');
      expect(screen.queryByTestId('auth-form-content')).not.toBeInTheDocument();
    });
  });
});
