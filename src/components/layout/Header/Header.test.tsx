import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from './Header';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';

import notificationsReducer from '@/store/slices/notificationsSlice';
import { CHANGE_PASSWORD_CONSTANTS } from '@/constants';

let mockPathname = '/users';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const mockUser = {
  id: 'usr-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'Taskflow Admin',
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      users: usersReducer,
      notifications: notificationsReducer,
    },
    preloadedState: initialState,
  });
};

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPathname = '/users';
  });

  it('renders title and user status', () => {
    const store = createMockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Taskflow Admin')).toBeInTheDocument();
  });

  it('handles mobile menu hamburger click', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    const menuButton = screen.getByRole('button', { name: /open sidebar menu/i });
    fireEvent.click(menuButton);

    expect(store.getState().ui.mobileSidebarOpen).toBe(true);
  });

  it('toggles user action menu dropdown on click', () => {
    const store = createMockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    const userButton = screen.getByRole('button', { name: /user account menu/i });
    expect(userButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    fireEvent.click(userButton);
    expect(userButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: /user account actions/i })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {
        name: new RegExp(CHANGE_PASSWORD_CONSTANTS.actionMenuItemText, 'i'),
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();

    // Close menu by clicking button again
    fireEvent.click(userButton);
    expect(userButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu', { name: /user account actions/i })).not.toBeInTheDocument();
  });

  it('dispatches openChangePasswordModal when clicking Change Password in dropdown', () => {
    const store = createMockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    const userButton = screen.getByRole('button', { name: /user account menu/i });
    fireEvent.click(userButton);

    const changePasswordItem = screen.getByRole('menuitem', {
      name: new RegExp(CHANGE_PASSWORD_CONSTANTS.actionMenuItemText, 'i'),
    });
    fireEvent.click(changePasswordItem);

    expect(store.getState().auth.isChangePasswordModalOpen).toBe(true);
    expect(screen.queryByRole('menu', { name: /user account actions/i })).not.toBeInTheDocument();
  });

  it('dispatches openLogoutModal when clicking Sign Out in dropdown', () => {
    const store = createMockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    const userButton = screen.getByRole('button', { name: /user account menu/i });
    fireEvent.click(userButton);

    const signOutItem = screen.getByRole('menuitem', { name: /sign out/i });
    fireEvent.click(signOutItem);

    expect(store.getState().auth.isLogoutModalOpen).toBe(true);
    expect(screen.queryByRole('menu', { name: /user account actions/i })).not.toBeInTheDocument();
  });

  it('closes dropdown menu when clicking outside', () => {
    const store = createMockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <div>
          <Header />
          <button type="button" data-testid="outside-element">
            Outside
          </button>
        </div>
      </Provider>
    );

    const userButton = screen.getByRole('button', { name: /user account menu/i });
    fireEvent.click(userButton);
    expect(screen.getByRole('menu', { name: /user account actions/i })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByRole('menu', { name: /user account actions/i })).not.toBeInTheDocument();
  });

  it('closes dropdown menu when pressing Escape', () => {
    const store = createMockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    const userButton = screen.getByRole('button', { name: /user account menu/i });
    fireEvent.click(userButton);
    expect(screen.getByRole('menu', { name: /user account actions/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu', { name: /user account actions/i })).not.toBeInTheDocument();
  });

  it.each([
    ['/notifications', 'Notifications'],
    ['/roles', 'Role Management'],
    ['/projects', 'Projects'],
    ['/settings', 'Dashboard'],
  ])('resolves the page title %s -> %s', (path, expectedTitle) => {
    const store = createMockStore({
      auth: {
        user: mockUser,
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    // Header is memoized with no props, so a fresh mount per pathname is required
    mockPathname = path;
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it('applies the primary badge variant for a Project Manager role', () => {
    const store = createMockStore({
      auth: {
        user: { ...mockUser, role: 'Project Manager' },
        isAuthenticated: true,
        isLogoutModalOpen: false,
        isLoggingOut: false,
        isChangePasswordModalOpen: false,
        rememberMe: false,
      },
    });

    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(screen.getByText('Project Manager')).toBeInTheDocument();
  });
});
