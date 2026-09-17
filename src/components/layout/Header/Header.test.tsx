import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from './Header';
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

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders title and user status', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(screen.getByText('User Management')).toBeInTheDocument();
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
});
