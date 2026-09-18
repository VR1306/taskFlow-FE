import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { authService } from '@/services/auth';
import { ApiError } from '@/services/api';
import { CHANGE_PASSWORD_CONSTANTS } from '@/constants';

jest.mock('@/services/auth', () => ({
  authService: {
    changePassword: jest.fn(),
  },
}));

describe('ChangePasswordModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(<ChangePasswordModal {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: CHANGE_PASSWORD_CONSTANTS.title })
    ).toBeInTheDocument();
    expect(screen.getByText(CHANGE_PASSWORD_CONSTANTS.description)).toBeInTheDocument();
    expect(screen.getByLabelText(/^current password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password/i, { selector: 'input' })).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^confirm new password/i, { selector: 'input' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: CHANGE_PASSWORD_CONSTANTS.cancelButtonText })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: CHANGE_PASSWORD_CONSTANTS.submitButtonText })
    ).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ChangePasswordModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByRole('heading', { name: CHANGE_PASSWORD_CONSTANTS.title })
    ).not.toBeInTheDocument();
  });

  it('toggles password visibility for current, new, and confirm fields', () => {
    render(<ChangePasswordModal {...defaultProps} />);

    const currentInput = screen.getByLabelText(/^current password/i, { selector: 'input' });
    const newInput = screen.getByLabelText(/^new password/i, { selector: 'input' });
    const confirmInput = screen.getByLabelText(/^confirm new password/i, { selector: 'input' });

    expect(currentInput).toHaveAttribute('type', 'password');
    expect(newInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    // Toggle current password
    const toggleCurrentBtn = screen.getByRole('button', {
      name: CHANGE_PASSWORD_CONSTANTS.showCurrentPasswordText,
    });
    fireEvent.click(toggleCurrentBtn);
    expect(currentInput).toHaveAttribute('type', 'text');

    // Toggle new password
    const toggleNewBtn = screen.getByRole('button', {
      name: CHANGE_PASSWORD_CONSTANTS.showNewPasswordText,
    });
    fireEvent.click(toggleNewBtn);
    expect(newInput).toHaveAttribute('type', 'text');

    // Toggle confirm password
    const toggleConfirmBtn = screen.getByRole('button', {
      name: CHANGE_PASSWORD_CONSTANTS.showConfirmPasswordText,
    });
    fireEvent.click(toggleConfirmBtn);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<ChangePasswordModal {...defaultProps} />);

    const submitBtn = screen.getByRole('button', {
      name: CHANGE_PASSWORD_CONSTANTS.submitButtonText,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
      expect(screen.getByText('New password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your new password')).toBeInTheDocument();
    });

    expect(authService.changePassword).not.toHaveBeenCalled();
  });

  it('shows error when new password is less than 8 characters', async () => {
    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/^current password/i, { selector: 'input' }), {
      target: { value: 'CurrentPass@123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i, { selector: 'input' }), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password/i, { selector: 'input' }), {
      target: { value: 'short' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: CHANGE_PASSWORD_CONSTANTS.submitButtonText })
    );

    await waitFor(() => {
      expect(screen.getByText('New password must be at least 8 characters')).toBeInTheDocument();
    });

    expect(authService.changePassword).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/^current password/i, { selector: 'input' }), {
      target: { value: 'CurrentPass@123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i, { selector: 'input' }), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password/i, { selector: 'input' }), {
      target: { value: 'DifferentPassword@456' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: CHANGE_PASSWORD_CONSTANTS.submitButtonText })
    );

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });

    expect(authService.changePassword).not.toHaveBeenCalled();
  });

  it('submits successfully and shows success view', async () => {
    (authService.changePassword as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Password changed successfully!',
    });

    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/^current password/i, { selector: 'input' }), {
      target: { value: 'CurrentPass@123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i, { selector: 'input' }), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password/i, { selector: 'input' }), {
      target: { value: 'NewPassword@123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: CHANGE_PASSWORD_CONSTANTS.submitButtonText })
    );

    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'CurrentPass@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
      expect(screen.getByText(CHANGE_PASSWORD_CONSTANTS.successSubtitle)).toBeInTheDocument();
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
    });

    // Close from success view
    const closeBtn = screen.getByRole('button', {
      name: CHANGE_PASSWORD_CONSTANTS.closeButtonText,
    });
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('displays API error alert when request fails with ApiError', async () => {
    (authService.changePassword as jest.Mock).mockRejectedValueOnce(
      new ApiError('Current password is incorrect', 401)
    );

    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/^current password/i, { selector: 'input' }), {
      target: { value: 'WrongPass@123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i, { selector: 'input' }), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password/i, { selector: 'input' }), {
      target: { value: 'NewPassword@123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: CHANGE_PASSWORD_CONSTANTS.submitButtonText })
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
    });
  });

  it('displays generic error alert when request fails with generic error object', async () => {
    (authService.changePassword as jest.Mock).mockRejectedValueOnce({
      error: 'Service temporarily unavailable',
    });

    render(<ChangePasswordModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/^current password/i, { selector: 'input' }), {
      target: { value: 'CurrentPass@123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i, { selector: 'input' }), {
      target: { value: 'NewPassword@123' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password/i, { selector: 'input' }), {
      target: { value: 'NewPassword@123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: CHANGE_PASSWORD_CONSTANTS.submitButtonText })
    );

    await waitFor(() => {
      expect(screen.getByText('Service temporarily unavailable')).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<ChangePasswordModal {...defaultProps} />);

    const cancelBtn = screen.getByRole('button', {
      name: CHANGE_PASSWORD_CONSTANTS.cancelButtonText,
    });
    fireEvent.click(cancelBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
