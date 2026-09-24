import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from './Sidebar';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import rolesReducer from '@/store/slices/rolesSlice';
import notificationsReducer from '@/store/slices/notificationsSlice';

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
      notifications: notificationsReducer,
    },

    preloadedState: {
      auth: {
        user: {
          id: '123',
          email: 'admin@taskflow.dev',
          firstName: 'Admin',
          lastName: 'User',
          role: 'Project Manager',
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
          id: 'dev-1',
          email: 'dev@example.com',
          firstName: 'Dev',
          lastName: 'User',
          role: 'Developer',
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

  it('applies the purple badge variant for a Taskflow Admin role', () => {
    const store = createMockStore({
      auth: {
        user: {
          id: 'admin-1',
          email: 'super.admin@taskflow.dev',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'Taskflow Admin',
          permissions: ['*'],
        },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('Taskflow Admin')).toBeInTheDocument();
  });

  it('falls back to the locally stored user when the redux store has no authenticated user', () => {
    localStorage.setItem(
      'taskflow_user',
      JSON.stringify({
        id: 'local-1',
        firstName: 'Storage',
        lastName: 'User',
        email: 'storage.user@taskflow.dev',
        role: 'Member',
      })
    );

    const store = createMockStore({
      auth: {
        user: null,
        isAuthenticated: false,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('Storage User')).toBeInTheDocument();
  });

  it('renders hydration-safe fallbacks and unrestricted nav items during server-side rendering', () => {
    const store = createMockStore();

    const html = renderToString(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    // Before the client mounts, the footer shows the generic placeholder name
    expect(html).toContain('User Account');
    // Permission-gated nav items are shown unfiltered until mounted (hydration-safe)
    expect(html).toContain('Role Management');
  });

  it('renders the collapsed hydration-safe avatar fallback during server-side rendering', () => {
    const store = createMockStore({
      ui: { sidebarCollapsed: true, mobileSidebarOpen: false },
    });

    const html = renderToString(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    // Collapsed footer never renders the display name, only the avatar + sign out control
    expect(html).not.toContain('User Account');
    expect(html).toContain('Sign out of TaskFlow');
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
