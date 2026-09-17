import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { authStorage } from '@/helpers';

describe('DashboardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStorage.clearAuthSession();
  });

  it('renders personalized greeting for logged-in user and quick access modules', async () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: 'usr-1',
        firstName: 'Samantha',
        lastName: 'Jones',
        email: 'samantha@example.com',
        role: 'Admin',
      })
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Samantha!')).toBeInTheDocument();
    });
    expect(screen.getByText('TaskFlow Workspace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to users module/i })).toBeInTheDocument();
    expect(screen.getByText('Users Directory')).toBeInTheDocument();
    expect(screen.getByText('Session & Authentication')).toBeInTheDocument();
    expect(screen.getByText(/Active Protected Session/i)).toBeInTheDocument();
  });

  it('renders default greeting when user profile is not found', async () => {
    jest.spyOn(authStorage, 'getUser').mockReturnValue(null);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, User!')).toBeInTheDocument();
    });
  });
});
