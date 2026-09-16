import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage, { metadata } from '@/app/(public)/auth/login/page';
import { LOGIN_CONSTANTS } from '@/constants';

describe('LoginPage Component', () => {
  it('renders LoginForm inside LoginPage', () => {
    render(<LoginPage />);

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
