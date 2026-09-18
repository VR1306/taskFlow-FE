import authReducer, {
  setCredentials,
  clearCredentials,
  openLogoutModal,
  closeLogoutModal,
  setIsLoggingOut,
  openChangePasswordModal,
  closeChangePasswordModal,
  AuthState,
} from './authSlice';

describe('authSlice Redux Reducer', () => {
  const initialAuthState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLogoutModalOpen: false,
    isLoggingOut: false,
    isChangePasswordModalOpen: false,
    rememberMe: false,
  };

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'Admin',
  };

  it('handles initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialAuthState);
  });

  it('handles setCredentials with user and rememberMe', () => {
    const state = authReducer(
      initialAuthState,
      setCredentials({ user: mockUser, rememberMe: true })
    );
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.rememberMe).toBe(true);
  });

  it('handles clearCredentials', () => {
    const populatedState: AuthState = {
      user: mockUser,
      isAuthenticated: true,
      isLogoutModalOpen: true,
      isLoggingOut: true,
      isChangePasswordModalOpen: true,
      rememberMe: true,
    };

    const state = authReducer(populatedState, clearCredentials());
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLogoutModalOpen).toBe(false);
    expect(state.isLoggingOut).toBe(false);
    expect(state.isChangePasswordModalOpen).toBe(false);
  });

  it('handles openLogoutModal and closeLogoutModal', () => {
    let state = authReducer(initialAuthState, openLogoutModal());
    expect(state.isLogoutModalOpen).toBe(true);

    state = authReducer(state, closeLogoutModal());
    expect(state.isLogoutModalOpen).toBe(false);
  });

  it('does not close logout modal if logging out is in progress', () => {
    const loggingOutState: AuthState = {
      ...initialAuthState,
      isLogoutModalOpen: true,
      isLoggingOut: true,
    };

    const state = authReducer(loggingOutState, closeLogoutModal());
    expect(state.isLogoutModalOpen).toBe(true);
  });

  it('handles setIsLoggingOut', () => {
    const state = authReducer(initialAuthState, setIsLoggingOut(true));
    expect(state.isLoggingOut).toBe(true);
  });

  it('handles openChangePasswordModal and closeChangePasswordModal', () => {
    let state = authReducer(initialAuthState, openChangePasswordModal());
    expect(state.isChangePasswordModalOpen).toBe(true);

    state = authReducer(state, closeChangePasswordModal());
    expect(state.isChangePasswordModalOpen).toBe(false);
  });
});
