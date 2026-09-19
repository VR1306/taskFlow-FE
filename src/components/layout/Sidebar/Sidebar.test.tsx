import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from './Sidebar';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import rolesReducer from '@/store/slices/rolesSlice';

jest.mock('next/navigation', () => ({
  usePathname: () => '/users',
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      users: usersReducer,
      roles: rolesReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: '123',
          email: 'admin@taskflow.dev',
          firstName: 'Admin',
          lastName: 'User',
          role: 'Admin',
          permissions: ['*'],
        },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
      ...initialState,
    },
  });
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders branding and module navigation links including Role Management for admin', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Role Management')).toBeInTheDocument();
  });

  it('hides permission-gated links when user lacks required permission', () => {
    const store = createMockStore({
      auth: {
        user: {
          id: 'guest-1',
          email: 'guest@example.com',
          firstName: 'Guest',
          lastName: 'User',
          role: 'Guest',
          permissions: ['users.view'],
        },
        token: 'mock-token',
        refreshToken: 'mock-refresh',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isLogoutModalOpen: false,
        isChangePasswordModalOpen: false,
        isChangePasswordLoading: false,
        changePasswordError: null,
      },
    });

    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.queryByText('Role Management')).not.toBeInTheDocument();
  });

  it('handles desktop collapse toggle button', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const collapseButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(collapseButton);

    expect(store.getState().ui.sidebarCollapsed).toBe(true);
  });

  it('triggers logout modal on clicking sign out button', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const signOutButtons = screen.getAllByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButtons[0]);

    expect(store.getState().auth.isLogoutModalOpen).toBe(true);
  });

  it('renders mobile backdrop when mobile sidebar is open and closes on backdrop click', () => {
    const store = createMockStore({
      ui: { sidebarCollapsed: false, mobileSidebarOpen: true },
    });

    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const backdrop = screen.getByTestId('mobile-sidebar-backdrop');
    expect(backdrop).toBeInTheDocument();

    fireEvent.click(backdrop);
    expect(store.getState().ui.mobileSidebarOpen).toBe(false);
  });
});
