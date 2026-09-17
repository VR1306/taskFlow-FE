import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '@/types';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLogoutModalOpen: boolean;
  isLoggingOut: boolean;
  rememberMe: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLogoutModalOpen: false,
  isLoggingOut: false,
  rememberMe: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser | null; rememberMe?: boolean }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = Boolean(action.payload.user);
      if (action.payload.rememberMe !== undefined) {
        state.rememberMe = action.payload.rememberMe;
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLogoutModalOpen = false;
      state.isLoggingOut = false;
    },
    openLogoutModal: (state) => {
      state.isLogoutModalOpen = true;
    },
    closeLogoutModal: (state) => {
      if (!state.isLoggingOut) {
        state.isLogoutModalOpen = false;
      }
    },
    setIsLoggingOut: (state, action: PayloadAction<boolean>) => {
      state.isLoggingOut = action.payload;
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  openLogoutModal,
  closeLogoutModal,
  setIsLoggingOut,
} = authSlice.actions;

export default authSlice.reducer;
