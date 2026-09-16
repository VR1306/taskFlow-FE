export const FORGOT_PASSWORD_CONSTANTS = {
  // Brand & Header
  brandName: 'TaskFlow',
  brandLogoAlt: 'TaskFlow Logo',
  title: 'Reset your password',
  subtitle: "Enter the email on your account and we'll send a reset link.",

  // Form Field Labels & Icons
  emailLabel: 'Work email',
  emailIconAlt: 'Email Icon',
  submitButtonText: 'Send reset link',
  submittingButtonText: 'Sending reset link...',
  backToSignInText: 'Back to sign in',

  // Placeholders
  emailPlaceholder: 'you@company.com',

  // Cooldown Timer
  resendCooldownSeconds: 90,

  // Validation Error Messages
  errors: {
    emailRequired: 'Work email is required',
    emailInvalid: 'Please enter a valid work email address',
    defaultSubmitError: 'Failed to send password reset link. Please check the email and try again.',
    defaultResendError: 'Failed to resend reset email. Please try again.',
  },

  // Success Confirmation State
  successTitle: 'Check your email',
  successSubtitle: "We've sent a password reset link to",
  successInstruction:
    "Didn't receive the email? Check your spam folder or wait for the timer to resend.",
  resendButtonText: 'Resend reset link',
  resendingButtonText: 'Resending...',
  resendSuccessMessage: 'Reset link resent successfully!',
  tryDifferentEmailText: 'Try with a different email address',

  // Links
  loginHref: '/auth/login',

  // Metadata / SEO
  metadata: {
    title: 'Forgot Password',
    flow: 'Auth',
    description: 'Reset your TaskFlow account password to regain access to your workspace.',
  },
} as const;

export default FORGOT_PASSWORD_CONSTANTS;
