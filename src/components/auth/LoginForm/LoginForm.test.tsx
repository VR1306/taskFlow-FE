import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LOGIN_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/services/auth', () => ({
  authService: {
    signIn: jest.fn(),
  },
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form elements, labels, and footer correctly', () => {
    render(<LoginForm />);

    // Header & Brand
    expect(screen.getByText(LOGIN_CONSTANTS.brandName)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_CONSTANTS.title)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_CONSTANTS.subtitle)).toBeInTheDocument();

    // Inputs
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(LOGIN_CONSTANTS.keepSignedInLabel)).toBeInTheDocument();

    // Links & Buttons
    expect(screen.getByText(LOGIN_CONSTANTS.forgotPasswordText)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: LOGIN_CONSTANTS.submitButtonText })
    ).toBeInTheDocument();
    expect(screen.getByText(LOGIN_CONSTANTS.footerActionText)).toBeInTheDocument();
  });

  it('keeps the submit button disabled when fields are empty or invalid', async () => {
    render(<LoginForm />);

    const submitBtn = screen.getByRole('button', {
      name: LOGIN_CONSTANTS.submitButtonText,
    });
    // Initially disabled on empty form
    expect(submitBtn).toBeDisabled();

    const emailInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.emailPlaceholder);
    const passwordInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.passwordPlaceholder);

    // Type invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    // Type valid email but short password
    fireEvent.change(emailInput, { target: { value: 'user@taskflow.io' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });
  });

  it('enables submit button only when valid email and password are typed, and submits successfully with custom onSubmit', async () => {
    const handleSubmitMock = jest.fn();
    render(<LoginForm onSubmit={handleSubmitMock} />);

    const submitBtn = screen.getByRole('button', {
      name: LOGIN_CONSTANTS.submitButtonText,
    });
    expect(submitBtn).toBeDisabled();

    const emailInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.emailPlaceholder);
    const passwordInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.passwordPlaceholder);
    const rememberMeCheckbox = screen.getByLabelText(LOGIN_CONSTANTS.keepSignedInLabel);

    fireEvent.change(emailInput, {
      target: { value: 'alex.rivera@taskflow.io' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'SecretPassword123!' },
    });
    fireEvent.click(rememberMeCheckbox);

    // Button should now be enabled
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmitMock).toHaveBeenCalledTimes(1);
      expect(handleSubmitMock).toHaveBeenCalledWith({
        email: 'alex.rivera@taskflow.io',
        password: 'SecretPassword123!',
        rememberMe: true,
      });
    });
  });

  it('calls authService.signIn and redirects to dashboard on successful login', async () => {
    (authService.signIn as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Sign-in successful!',
      token: 'mock-jwt-token',
      user: { id: '1', email: 'user@taskflow.com', firstName: 'Alex', lastName: 'R' },
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.emailPlaceholder);
    const passwordInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.passwordPlaceholder);
    const submitBtn = screen.getByRole('button', {
      name: LOGIN_CONSTANTS.submitButtonText,
    });

    fireEvent.change(emailInput, { target: { value: 'user@taskflow.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith({
        email: 'user@taskflow.com',
        password: 'Password123!',
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays server error alert when authService.signIn fails', async () => {
    (authService.signIn as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.emailPlaceholder);
    const passwordInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.passwordPlaceholder);
    const submitBtn = screen.getByRole('button', {
      name: LOGIN_CONSTANTS.submitButtonText,
    });

    fireEvent.change(emailInput, { target: { value: 'user@taskflow.com' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPassword123' } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });

  it('toggles password visibility between text and password on icon click', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.passwordPlaceholder);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', {
      name: LOGIN_CONSTANTS.showPasswordText,
    });
    expect(toggleButton).toBeInTheDocument();

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: LOGIN_CONSTANTS.hidePasswordText })
    ).toBeInTheDocument();

    // Click to hide password
    fireEvent.click(screen.getByRole('button', { name: LOGIN_CONSTANTS.hidePasswordText }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
