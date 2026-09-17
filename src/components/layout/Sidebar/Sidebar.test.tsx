import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from './Sidebar';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';

jest.mock('next/navigation', () => ({
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

describe('Sidebar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders branding and module navigation links', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
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
