import React from 'react';
import { render, screen } from '@testing-library/react';
import StoreProvider from './StoreProvider';
import { authStorage } from '@/helpers';

describe('StoreProvider Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders children within Redux provider and hydrates user when available', () => {
    jest.spyOn(authStorage, 'getUser').mockReturnValue({
      id: 'usr-99',
      firstName: 'Hydrated',
      lastName: 'User',
      email: 'hydrated@example.com',
      role: 'Admin',
    });
    jest.spyOn(authStorage, 'getRememberMe').mockReturnValue(true);

    render(
      <StoreProvider>
        <div data-testid="child-element">App Content</div>
      </StoreProvider>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('renders children when no user is stored in authStorage', () => {
    jest.spyOn(authStorage, 'getUser').mockReturnValue(null);
    jest.spyOn(authStorage, 'getRememberMe').mockReturnValue(false);

    render(
      <StoreProvider>
        <div data-testid="guest-element">Guest Content</div>
      </StoreProvider>
    );

    expect(screen.getByTestId('guest-element')).toBeInTheDocument();
  });
});
