export const RESET_PASSWORD_CONSTANTS = {
  // Brand & Header
  brandName: 'TaskFlow',
  brandLogoAlt: 'TaskFlow Logo',
  passwordIconAlt: 'Password Icon',
  title: 'Choose a new password',
  subtitlePrefix: 'For',
  defaultSubtitle: 'Create a new strong password for your TaskFlow account.',

  // Form Field Labels & Placeholders
  passwordLabel: 'New password',
  passwordPlaceholder: 'At least 8 characters',
  confirmPasswordLabel: 'Confirm new password',
  confirmPasswordPlaceholder: 'Repeat password',
  showPasswordText: 'Show password',
  hidePasswordText: 'Hide password',
  showConfirmPasswordText: 'Show confirm password',
  hideConfirmPasswordText: 'Hide confirm password',

  // Buttons & Actions
  submitButtonText: 'Update password',
  submittingButtonText: 'Updating password...',
  backToSignInText: 'Back to sign in',
  requestNewLinkText: 'Request a new reset link',
  goToSignInButtonText: 'Sign in to TaskFlow',

  // Validation Error Messages & Fallbacks
  errors: {
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsDoNotMatch: 'Passwords do not match',
    tokenMissing: 'Reset token is missing. Please use the link provided in your email.',
    defaultSubmitError: 'Failed to update password. Please try again.',
  },

  // Success Confirmation State
  successTitle: 'Password reset complete',
  successSubtitle:
    'Your password has been successfully updated. You can now sign in with your new password.',

  // Invalid / Expired Token State
  invalidTokenTitle: 'Invalid or expired link',
  invalidTokenDescription:
    'This password reset link is invalid or has expired. Please request a new link to reset your password.',

  // Links
  loginHref: '/auth/login',
  requestResetHref: '/auth/forgot-password',

  // Metadata / SEO
  metadata: {
    title: 'Reset Password',
    flow: 'Auth',
    description: 'Choose a new password for your TaskFlow workspace account.',
  },
} as const;

export default RESET_PASSWORD_CONSTANTS;
