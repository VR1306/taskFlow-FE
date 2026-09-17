import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedLayout from './layout';
import { authStorage } from '@/helpers';
import { authService } from '@/services/auth';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/users',
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      users: usersReducer,
    },
    preloadedState: initialState,
  });
};

describe('ProtectedLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStorage.clearAuthSession();
    localStorage.clear();
  });

  it('renders Sidebar, Header, and main content', async () => {
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

    const store = createMockStore();

    render(
      <Provider store={store}>
        <ProtectedLayout>
          <div data-testid="child-content">Users Content</div>
        </ProtectedLayout>
      </Provider>
    );

    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getAllByText('User Management').length).toBeGreaterThan(0);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText(/Alice Smith/i).length).toBeGreaterThan(0);
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('opens confirmation modal on clicking Sign Out and cancels correctly', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <ProtectedLayout>
          <div>Content</div>
        </ProtectedLayout>
      </Provider>
    );

    // Click Sign Out
    const signOutBtn = screen.getAllByRole('button', { name: /sign out/i })[0];
    fireEvent.click(signOutBtn);

    // Modal should be visible
    expect(screen.getByText('Sign Out of TaskFlow')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to sign out/i)).toBeInTheDocument();

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    // Modal should close
    expect(screen.queryByText('Sign Out of TaskFlow')).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('confirms logout from modal and navigates to login page', async () => {
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

    const store = createMockStore();

    render(
      <Provider store={store}>
        <ProtectedLayout>
          <div>Content</div>
        </ProtectedLayout>
      </Provider>
    );

    // Open modal
    const signOutBtn = screen.getAllByRole('button', { name: /sign out/i })[0];
    fireEvent.click(signOutBtn);

    // Click Confirm
    const confirmBtn = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledWith('valid-refresh-token');
      expect(clearAuthSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });
});
