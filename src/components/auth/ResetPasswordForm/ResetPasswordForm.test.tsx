import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { RESET_PASSWORD_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';
import { ApiError } from '@/services/api';

const mockGet = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

jest.mock('@/services/auth', () => ({
  authService: {
    resetPassword: jest.fn(),
  },
}));

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((key: string) => {
      if (key === 'token') return 'valid-test-token-123';
      if (key === 'email') return 'diego.ramos@northwind.co';
      return null;
    });
  });

  it('renders all form elements, labels, and subtitle with email correctly', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText(RESET_PASSWORD_CONSTANTS.brandName)).toBeInTheDocument();
    expect(screen.getByText(RESET_PASSWORD_CONSTANTS.title)).toBeInTheDocument();
    expect(screen.getByText('diego.ramos@northwind.co')).toBeInTheDocument();

    expect(screen.getByLabelText(/^new password/i, { selector: 'input' })).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^confirm new password/i, { selector: 'input' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: RESET_PASSWORD_CONSTANTS.submitButtonText })
    ).toBeInTheDocument();
    expect(screen.getByText(RESET_PASSWORD_CONSTANTS.backToSignInText)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: new RegExp(RESET_PASSWORD_CONSTANTS.requestNewLinkText, 'i'),
      })
    ).not.toBeInTheDocument();
  });

  it('disables submit button when token is missing but does not show request new link initially', () => {
    mockGet.mockReturnValue(null);

    render(<ResetPasswordForm />);

    expect(
      screen.getByRole('button', { name: RESET_PASSWORD_CONSTANTS.submitButtonText })
    ).toBeDisabled();
    expect(
      screen.queryByRole('link', {
        name: new RegExp(RESET_PASSWORD_CONSTANTS.requestNewLinkText, 'i'),
      })
    ).not.toBeInTheDocument();
  });

  it('keeps submit button disabled when passwords are invalid or mismatching', async () => {
    render(<ResetPasswordForm />);

    const submitBtn = screen.getByRole('button', {
      name: RESET_PASSWORD_CONSTANTS.submitButtonText,
    });
    expect(submitBtn).toBeDisabled();

    const passwordInput = screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder);
    const confirmInput = screen.getByPlaceholderText(
      RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder
    );

    // Too short
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    // Mismatch
    fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass123' } });
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    // Valid matching
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('submits successfully with custom onSubmit prop', async () => {
    const handleSubmitMock = jest.fn();
    render(<ResetPasswordForm onSubmit={handleSubmitMock} />);

    const passwordInput = screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder);
    const confirmInput = screen.getByPlaceholderText(
      RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder
    );
    const submitBtn = screen.getByRole('button', {
      name: RESET_PASSWORD_CONSTANTS.submitButtonText,
    });

    fireEvent.change(passwordInput, { target: { value: 'NewStrongPassword@123' } });
    fireEvent.change(confirmInput, { target: { value: 'NewStrongPassword@123' } });

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmitMock).toHaveBeenCalledWith({
        password: 'NewStrongPassword@123',
        confirmPassword: 'NewStrongPassword@123',
      });
      expect(screen.getByText(RESET_PASSWORD_CONSTANTS.successTitle)).toBeInTheDocument();
    });
  });

  it('calls authService.resetPassword and displays success state', async () => {
    (authService.resetPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Password reset successful!',
    });

    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder);
    const confirmInput = screen.getByPlaceholderText(
      RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder
    );
    const submitBtn = screen.getByRole('button', {
      name: RESET_PASSWORD_CONSTANTS.submitButtonText,
    });

    fireEvent.change(passwordInput, { target: { value: 'NewStrongPassword@123' } });
    fireEvent.change(confirmInput, { target: { value: 'NewStrongPassword@123' } });

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith({
        token: 'valid-test-token-123',
        password: 'NewStrongPassword@123',
        confirmPassword: 'NewStrongPassword@123',
      });
      expect(screen.getByText(RESET_PASSWORD_CONSTANTS.successTitle)).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: RESET_PASSWORD_CONSTANTS.goToSignInButtonText })
      ).toBeInTheDocument();
    });
  });

  it('displays "Request a new reset link" ONLY when error status is 401', async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValue(
      new ApiError('Token is invalid or has expired', 401)
    );

    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder);
    const confirmInput = screen.getByPlaceholderText(
      RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder
    );
    const submitBtn = screen.getByRole('button', {
      name: RESET_PASSWORD_CONSTANTS.submitButtonText,
    });

    fireEvent.change(passwordInput, { target: { value: 'NewStrongPassword@123' } });
    fireEvent.change(confirmInput, { target: { value: 'NewStrongPassword@123' } });

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Token is invalid or has expired');
      const requestLink = screen.getByRole('link', {
        name: new RegExp(RESET_PASSWORD_CONSTANTS.requestNewLinkText, 'i'),
      });
      expect(requestLink).toBeInTheDocument();
      expect(requestLink).toHaveAttribute('href', RESET_PASSWORD_CONSTANTS.requestResetHref);
    });
  });

  it('does NOT display "Request a new reset link" when error status is not 401 (e.g. 500 or standard Error)', async () => {
    (authService.resetPassword as jest.Mock).mockRejectedValue(
      new ApiError('Internal server error occurred', 500)
    );

    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder);
    const confirmInput = screen.getByPlaceholderText(
      RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder
    );
    const submitBtn = screen.getByRole('button', {
      name: RESET_PASSWORD_CONSTANTS.submitButtonText,
    });

    fireEvent.change(passwordInput, { target: { value: 'NewStrongPassword@123' } });
    fireEvent.change(confirmInput, { target: { value: 'NewStrongPassword@123' } });

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Internal server error occurred');
      expect(
        screen.queryByRole('link', {
          name: new RegExp(RESET_PASSWORD_CONSTANTS.requestNewLinkText, 'i'),
        })
      ).not.toBeInTheDocument();
    });
  });

  it('handles submission when token is somehow missing inside handleFormSubmit', async () => {
    mockGet.mockReturnValue(null);
    render(<ResetPasswordForm token="" />);

    const passwordInput = screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder);
    const confirmInput = screen.getByPlaceholderText(
      RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder
    );

    fireEvent.change(passwordInput, { target: { value: 'NewStrongPassword@123' } });
    fireEvent.change(confirmInput, { target: { value: 'NewStrongPassword@123' } });

    const form = passwordInput.closest('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        RESET_PASSWORD_CONSTANTS.errors.tokenMissing
      );
      expect(
        screen.queryByRole('link', {
          name: new RegExp(RESET_PASSWORD_CONSTANTS.requestNewLinkText, 'i'),
        })
      ).not.toBeInTheDocument();
    });
  });

  it('toggles password visibility when toggle buttons are clicked', () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder);
    const confirmInput = screen.getByPlaceholderText(
      RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder
    );

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const togglePasswordBtn = screen.getByRole('button', {
      name: RESET_PASSWORD_CONSTANTS.showPasswordText,
    });
    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    const toggleConfirmBtn = screen.getByRole('button', {
      name: RESET_PASSWORD_CONSTANTS.showConfirmPasswordText,
    });
    fireEvent.click(toggleConfirmBtn);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });
});

it.each([
  { error: new Error('Connection failed'), message: 'Connection failed', unauthorized: false },
  {
    error: { message: 'Expired link', statusCode: 401 },
    message: 'Expired link',
    unauthorized: true,
  },
  { error: {}, message: RESET_PASSWORD_CONSTANTS.errors.defaultSubmitError, unauthorized: false },
  { error: null, message: RESET_PASSWORD_CONSTANTS.errors.defaultSubmitError, unauthorized: false },
])('shows safe reset errors for $message', async ({ error, message, unauthorized }) => {
  render(
    <ResetPasswordForm
      token="reset-token"
      email="person@example.com"
      onSubmit={async () => {
        throw error;
      }}
    />
  );
  fireEvent.change(screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.passwordPlaceholder), {
    target: { value: 'NewStrongPassword@123' },
  });
  fireEvent.change(
    screen.getByPlaceholderText(RESET_PASSWORD_CONSTANTS.confirmPasswordPlaceholder),
    { target: { value: 'NewStrongPassword@123' } }
  );
  const submit = screen.getByRole('button', { name: RESET_PASSWORD_CONSTANTS.submitButtonText });
  await waitFor(() => expect(submit).toBeEnabled());
  fireEvent.click(submit);
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  const recovery = screen.queryByRole('link', {
    name: new RegExp(RESET_PASSWORD_CONSTANTS.requestNewLinkText, 'i'),
  });
  if (unauthorized) expect(recovery).toBeInTheDocument();
  else expect(recovery).not.toBeInTheDocument();
});
