import React from 'react';
import { render, screen } from '@testing-library/react';
import ResetPasswordPage, { metadata } from '@/app/(public)/auth/reset-password/page';
import { RESET_PASSWORD_CONSTANTS } from '@/constants';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? 'test-token' : null),
  }),
}));

describe('ResetPasswordPage Component', () => {
  it('renders ResetPasswordForm inside ResetPasswordPage', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText(RESET_PASSWORD_CONSTANTS.title)).toBeInTheDocument();
    expect(screen.getByText(RESET_PASSWORD_CONSTANTS.defaultSubtitle)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: RESET_PASSWORD_CONSTANTS.submitButtonText })
    ).toBeInTheDocument();
  });

  it('exports valid metadata for SEO and page title', () => {
    expect(metadata.title).toBe('Reset Password | Auth - TaskFlow');
    expect(metadata.description).toBe('Choose a new password for your TaskFlow workspace account.');
  });
});
