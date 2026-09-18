export const CHANGE_PASSWORD_CONSTANTS = {
  // Modal Header
  title: 'Change Password',
  description: 'Update your password to keep your TaskFlow account secure.',

  // Form Field Labels & Placeholders
  currentPasswordLabel: 'Current Password',
  currentPasswordPlaceholder: 'Enter your current password',
  newPasswordLabel: 'New Password',
  newPasswordPlaceholder: 'At least 8 characters',
  confirmPasswordLabel: 'Confirm New Password',
  confirmPasswordPlaceholder: 'Repeat your new password',

  // Password Visibility Labels
  showCurrentPasswordText: 'Show current password',
  hideCurrentPasswordText: 'Hide current password',
  showNewPasswordText: 'Show new password',
  hideNewPasswordText: 'Hide new password',
  showConfirmPasswordText: 'Show confirm password',
  hideConfirmPasswordText: 'Hide confirm password',

  // Buttons & Actions
  cancelButtonText: 'Cancel',
  submitButtonText: 'Change Password',
  submittingButtonText: 'Changing Password...',
  closeButtonText: 'Close',

  // Action Menu
  actionMenuItemText: 'Change Password',
  actionMenuItemAriaLabel: 'Open change password modal',

  // Success Confirmation State
  successTitle: 'Password Changed Successfully!',
  successSubtitle:
    'Your account password has been updated. You can continue using your current session.',

  // Error Messages
  errors: {
    currentPasswordRequired: 'Current password is required',
    newPasswordRequired: 'New password is required',
    newPasswordMinLength: 'New password must be at least 8 characters',
    confirmPasswordRequired: 'Please confirm your new password',
    passwordsDoNotMatch: 'New passwords do not match',
    defaultSubmitError:
      'Failed to change password. Please verify your current password and try again.',
  },
} as const;

export default CHANGE_PASSWORD_CONSTANTS;
