import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginForm } from '@/components/auth/LoginForm';
import { LOGIN_CONSTANTS } from '@/constants';
import { authService } from '@/services/auth';
import { authStorage } from '@/helpers';
import authReducer from '@/store/slices/authSlice';

const createTestStore = () => configureStore({ reducer: { auth: authReducer } });

const renderLoginForm = (props?: React.ComponentProps<typeof LoginForm>) => {
  const store = createTestStore();
  const utils = render(
    <Provider store={store}>
      <LoginForm {...props} />
    </Provider>
  );
  return { store, ...utils };
};

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockSearchParamsGet = jest.fn((_key: string): string | null => null);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsGet(key),
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
    mockSearchParamsGet = jest.fn((_key: string): string | null => null);
    localStorage.clear();
  });

  it('renders all form elements, labels, and footer correctly', () => {
    renderLoginForm();

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

  it('pre-fills email and rememberMe checkbox when stored in authStorage', async () => {
    authStorage.setRememberedCredentials(true, 'remembered.user@taskflow.io');

    renderLoginForm();

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText(
        LOGIN_CONSTANTS.emailPlaceholder
      ) as HTMLInputElement;
      expect(emailInput.value).toBe('remembered.user@taskflow.io');
      const rememberCheckbox = screen.getByLabelText(
        LOGIN_CONSTANTS.keepSignedInLabel
      ) as HTMLInputElement;
      expect(rememberCheckbox.checked).toBe(true);
    });
  });

  it('keeps the submit button disabled when fields are empty or invalid', async () => {
    renderLoginForm();

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
    renderLoginForm({ onSubmit: handleSubmitMock });

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

  it('calls authService.signIn with rememberMe and redirects to the first module the response permissions grant', async () => {
    (authService.signIn as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Sign-in successful!',
      token: 'mock-jwt-token',
      accessToken: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'user@taskflow.com',
        firstName: 'Alex',
        lastName: 'R',
        role: 'Custom',
        permissions: ['users.view'],
      },
    });

    const { store } = renderLoginForm();

    const emailInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.emailPlaceholder);
    const passwordInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.passwordPlaceholder);
    const rememberMeCheckbox = screen.getByLabelText(LOGIN_CONSTANTS.keepSignedInLabel);
    const submitBtn = screen.getByRole('button', {
      name: LOGIN_CONSTANTS.submitButtonText,
    });

    fireEvent.change(emailInput, { target: { value: 'user@taskflow.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(rememberMeCheckbox);

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith({
        email: 'user@taskflow.com',
        password: 'Password123!',
        rememberMe: true,
      });
      expect(mockReplace).toHaveBeenCalledWith('/users');
    });

    // Redux must be hydrated with the logged-in user synchronously on login,
    // since nothing re-runs StoreProvider's storage-hydration effect on this
    // client-side navigation — components gated on state.auth.user (like the
    // notifications bell) would otherwise stay stale until a full page reload.
    expect(store.getState().auth.user).toEqual({
      id: '1',
      email: 'user@taskflow.com',
      firstName: 'Alex',
      lastName: 'R',
      role: 'Custom',
      permissions: ['users.view'],
    });
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('redirects to searchParams redirect url when available', async () => {
    mockSearchParamsGet = jest.fn((key: string) => (key === 'redirect' ? '/users' : null));

    (authService.signIn as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Sign-in successful!',
      token: 'mock-jwt-token',
      user: { id: '1', email: 'user@taskflow.com', firstName: 'Alex', lastName: 'R' },
    });

    renderLoginForm();

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
      expect(mockReplace).toHaveBeenCalledWith('/users');
    });
  });

  it('falls back to dashboard when response does not provide redirect info', async () => {
    (authService.signIn as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Sign-in successful!',
      token: 'mock-jwt-token',
      user: { id: '1', email: 'user@taskflow.com', firstName: 'Alex', lastName: 'R' },
    });

    renderLoginForm();

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
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays server error alert when authService.signIn fails', async () => {
    (authService.signIn as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    renderLoginForm();

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

  it('shows the default error message when signIn rejects with a non-Error value', async () => {
    (authService.signIn as jest.Mock).mockRejectedValue('unexpected rejection');

    renderLoginForm();

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
      expect(screen.getByRole('alert')).toHaveTextContent(
        LOGIN_CONSTANTS.errors.defaultSubmitError
      );
    });
  });

  it('toggles password visibility between text and password on icon click', () => {
    renderLoginForm();

    const passwordInput = screen.getByPlaceholderText(LOGIN_CONSTANTS.passwordPlaceholder);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', {
      name: LOGIN_CONSTANTS.showPasswordText,
    });
    expect(toggleButton).toBeInTheDocument();

    // Mouse down on the toggle should not steal focus from the input
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(mouseDownEvent, 'preventDefault');
    fireEvent(toggleButton, mouseDownEvent);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);

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
