import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage, { metadata } from '@/app/(public)/auth/login/page';
import { LOGIN_CONSTANTS } from '@/constants';
import authReducer from '@/store/slices/authSlice';

describe('LoginPage Component', () => {
  it('renders LoginForm inside LoginPage', () => {
    render(
      <Provider store={configureStore({ reducer: { auth: authReducer } })}>
        <LoginPage />
      </Provider>
    );

    expect(screen.getByText(LOGIN_CONSTANTS.title)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_CONSTANTS.subtitle)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: LOGIN_CONSTANTS.submitButtonText })
    ).toBeInTheDocument();
  });

  it('exports valid metadata for SEO and page title', () => {
    expect(metadata.title).toBe('Sign In | Auth - TaskFlow');
    expect(metadata.description).toBe(
      'Sign in to your TaskFlow workspace to manage tasks, sprints, and team workflows.'
    );
  });
});
