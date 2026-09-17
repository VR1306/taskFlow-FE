import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProtectedLayout from './layout';
import { authStorage } from '@/helpers';
import { authService } from '@/services/auth';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/users',
}));

describe('ProtectedLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStorage.clearAuthSession();
  });

  it('renders branding, active navigation links, and children content', async () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: '123',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        role: 'Admin',
      })
    );

    render(
      <ProtectedLayout>
        <div data-testid="child-content">Users Content</div>
      </ProtectedLayout>
    );

    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getByText('Users Module')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('handles sign-out and navigates to login page', async () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: '123',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        role: 'Admin',
      })
    );
    jest.spyOn(authStorage, 'getRefreshToken').mockReturnValue('valid-refresh-token');
    const logoutSpy = jest
      .spyOn(authService, 'logout')
      .mockResolvedValue({ success: true, message: 'Logged out' });
    const clearAuthSpy = jest.spyOn(authStorage, 'clearAuthSession');

    render(
      <ProtectedLayout>
        <div>Content</div>
      </ProtectedLayout>
    );

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledWith('valid-refresh-token');
      expect(clearAuthSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });
});
