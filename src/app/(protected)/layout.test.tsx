import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedLayout from './layout';
import { authStorage } from '@/helpers';
import { authService } from '@/services/auth';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
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

  it('redirects to /auth/login with replace when unauthenticated', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <ProtectedLayout>
          <div data-testid="child-content">Users Content</div>
        </ProtectedLayout>
      </Provider>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/auth/login');
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });

  it('renders Sidebar, Header, and main content when authenticated', async () => {
    authStorage.setTokens('valid-jwt-token');
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
    authStorage.setTokens('valid-jwt-token');
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
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('confirms logout from modal and navigates to login page with replace', async () => {
    authStorage.setTokens('valid-jwt-token');
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
      expect(mockReplace).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('renders ChangePasswordModal when isChangePasswordModalOpen is true and closes it', async () => {
    authStorage.setTokens('valid-jwt-token');
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

    const store = createMockStore({
      auth: {
        user: {
          id: '123',
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          role: 'Admin',
        },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: true,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <ProtectedLayout>
          <div>Content</div>
        </ProtectedLayout>
      </Provider>
    );

    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    expect(
      screen.getByText('Update your password to keep your TaskFlow account secure.')
    ).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(store.getState().auth.isChangePasswordModalOpen).toBe(false);
  });

  it('applies the collapsed sidebar padding class when the sidebar is collapsed', async () => {
    authStorage.setTokens('valid-jwt-token');
    const store = createMockStore({
      ui: {
        sidebarCollapsed: true,
        mobileSidebarOpen: false,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <ProtectedLayout>
          <div data-testid="child-content">Content</div>
        </ProtectedLayout>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    const mainArea = container.querySelector('.md\\:pl-20');
    expect(mainArea).toBeInTheDocument();
  });

  it('triggers checkAuth on popstate and pageshow events and unmounts cleanly', async () => {
    authStorage.setTokens('valid-jwt-token');
    const store = createMockStore();

    const { unmount } = render(
      <Provider store={store}>
        <ProtectedLayout>
          <div>Child</div>
        </ProtectedLayout>
      </Provider>
    );

    // Dispatch events while authenticated
    act(() => {
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new Event('pageshow'));
    });

    // Clear token and dispatch popstate to trigger redirect
    authStorage.clearAuthSession();
    act(() => {
      window.dispatchEvent(new Event('popstate'));
    });
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');

    unmount();
  });

  it('handles logout when refreshToken is absent and when logout service rejects', async () => {
    authStorage.setTokens('valid-jwt-token');
    jest.spyOn(authStorage, 'getRefreshToken').mockReturnValue('');
    const store = createMockStore();

    render(
      <Provider store={store}>
        <ProtectedLayout>
          <div>Child</div>
        </ProtectedLayout>
      </Provider>
    );

    const signOutBtn = screen.getAllByRole('button', { name: /sign out/i })[0];
    fireEvent.click(signOutBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('handles logout when authService.logout rejects', async () => {
    authStorage.setTokens('valid-jwt-token');
    jest.spyOn(authStorage, 'getRefreshToken').mockReturnValue('some-token');
    jest.spyOn(authService, 'logout').mockRejectedValue(new Error('Network error'));
    const store = createMockStore();

    render(
      <Provider store={store}>
        <ProtectedLayout>
          <div>Child</div>
        </ProtectedLayout>
      </Provider>
    );

    const signOutBtn = screen.getAllByRole('button', { name: /sign out/i })[0];
    fireEvent.click(signOutBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/auth/login');
    });
  });
});
