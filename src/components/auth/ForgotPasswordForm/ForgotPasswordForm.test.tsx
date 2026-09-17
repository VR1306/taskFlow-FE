import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { FORGOT_PASSWORD_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';

jest.mock('@/services/auth', () => ({
  authService: {
    forgotPassword: jest.fn(),
  },
}));

describe('ForgotPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form elements, labels, and links correctly', () => {
    render(<ForgotPasswordForm />);

    // Brand & Header
    expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.brandName)).toBeInTheDocument();
    expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.title)).toBeInTheDocument();
    expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.subtitle)).toBeInTheDocument();

    // Input
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();

    // Buttons & Links
    expect(
      screen.getByRole('button', { name: FORGOT_PASSWORD_CONSTANTS.submitButtonText })
    ).toBeInTheDocument();
    expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.backToSignInText)).toBeInTheDocument();
  });

  it('keeps submit button disabled when email field is empty or invalid', async () => {
    render(<ForgotPasswordForm />);

    const submitBtn = screen.getByRole('button', {
      name: FORGOT_PASSWORD_CONSTANTS.submitButtonText,
    });
    // Initially disabled on empty form
    expect(submitBtn).toBeDisabled();

    const emailInput = screen.getByPlaceholderText(FORGOT_PASSWORD_CONSTANTS.emailPlaceholder);

    // Type invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    // Type valid email
    fireEvent.change(emailInput, { target: { value: 'user@taskflow.io' } });
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('submits successfully with custom onSubmit prop', async () => {
    const handleSubmitMock = jest.fn();
    render(<ForgotPasswordForm onSubmit={handleSubmitMock} />);

    const submitBtn = screen.getByRole('button', {
      name: FORGOT_PASSWORD_CONSTANTS.submitButtonText,
    });
    const emailInput = screen.getByPlaceholderText(FORGOT_PASSWORD_CONSTANTS.emailPlaceholder);

    fireEvent.change(emailInput, {
      target: { value: 'alex.rivera@taskflow.io' },
    });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmitMock).toHaveBeenCalledTimes(1);
      expect(handleSubmitMock).toHaveBeenCalledWith({
        email: 'alex.rivera@taskflow.io',
      });
      expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.successTitle)).toBeInTheDocument();
    });
  });

  it('calls authService.forgotPassword and shows success view with 90s countdown timer on resend button', async () => {
    jest.useFakeTimers();
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Password reset link successfully dispatched to your email address!',
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(FORGOT_PASSWORD_CONSTANTS.emailPlaceholder);
    const submitBtn = screen.getByRole('button', {
      name: FORGOT_PASSWORD_CONSTANTS.submitButtonText,
    });

    fireEvent.change(emailInput, { target: { value: 'user@taskflow.io' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith({
        email: 'user@taskflow.io',
      });
      expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.successTitle)).toBeInTheDocument();
      expect(screen.getByText('user@taskflow.io')).toBeInTheDocument();
    });

    // Verify the resend button is initially disabled with 1:30 countdown
    const resendBtn = screen.getByRole('button', {
      name: `${FORGOT_PASSWORD_CONSTANTS.resendButtonText} (1:30)`,
    });
    expect(resendBtn).toBeDisabled();

    // Advance timer by 30 seconds -> 1:00
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(
      screen.getByRole('button', {
        name: `${FORGOT_PASSWORD_CONSTANTS.resendButtonText} (1:00)`,
      })
    ).toBeDisabled();

    // Advance timer by 60 more seconds -> reaches 0, becomes enabled
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    const enabledResendBtn = screen.getByRole('button', {
      name: FORGOT_PASSWORD_CONSTANTS.resendButtonText,
    });
    expect(enabledResendBtn).not.toBeDisabled();

    // Click to resend
    fireEvent.click(enabledResendBtn);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledTimes(2);
      expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.resendSuccessMessage)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('displays server error alert when authService.forgotPassword fails', async () => {
    (authService.forgotPassword as jest.Mock).mockRejectedValue(new Error('User not found'));

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(FORGOT_PASSWORD_CONSTANTS.emailPlaceholder);
    const submitBtn = screen.getByRole('button', {
      name: FORGOT_PASSWORD_CONSTANTS.submitButtonText,
    });

    fireEvent.change(emailInput, { target: { value: 'notfound@taskflow.io' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('User not found');
    });
  });

  it('allows returning to form and changing email when clicking "Try with a different email address"', async () => {
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Success',
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByPlaceholderText(FORGOT_PASSWORD_CONSTANTS.emailPlaceholder);
    const submitBtn = screen.getByRole('button', {
      name: FORGOT_PASSWORD_CONSTANTS.submitButtonText,
    });

    fireEvent.change(emailInput, { target: { value: 'user@taskflow.io' } });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.successTitle)).toBeInTheDocument();
    });

    const tryDifferentBtn = screen.getByRole('button', {
      name: FORGOT_PASSWORD_CONSTANTS.tryDifferentEmailText,
    });
    fireEvent.click(tryDifferentBtn);

    await waitFor(() => {
      expect(screen.getByText(FORGOT_PASSWORD_CONSTANTS.title)).toBeInTheDocument();
      const updatedEmailInput = screen.getByPlaceholderText(
        FORGOT_PASSWORD_CONSTANTS.emailPlaceholder
      );
      expect(updatedEmailInput).toHaveValue('user@taskflow.io');
    });
  });
});
