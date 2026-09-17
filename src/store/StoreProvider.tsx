'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { setCredentials } from './slices/authSlice';
import { authStorage } from '@/helpers';

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Safely hydrate auth state on client mount
    const user = authStorage.getUser();
    const rememberMe = authStorage.getRememberMe();
    if (user) {
      store.dispatch(setCredentials({ user, rememberMe }));
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
