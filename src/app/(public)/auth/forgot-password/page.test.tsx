import React from 'react';
import { render, screen } from '@testing-library/react';
import ForgotPasswordPage, { metadata } from '@/app/(public)/auth/forgot-password/page';
import { FORGOT_PASSWORD_CONSTANTS } from '@/constants';

describe('ForgotPasswordPage Component', () => {
  it('renders ForgotPasswordForm inside ForgotPasswordPage', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.title)).toBeInTheDocument();
    expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.subtitle)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: FORGOT_PASSWORD_CONSTANTS.submitButtonText })
    ).toBeInTheDocument();
  });

  it('exports valid metadata for SEO and page title', () => {
    expect(metadata.title).toBe('Forgot Password | Auth - TaskFlow');
    expect(metadata.description).toBe(
      'Reset your TaskFlow account password to regain access to your workspace.'
    );
  });
});
