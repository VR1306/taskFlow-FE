export const LOGIN_CONSTANTS = {
  // Brand & Header
  brandName: 'TaskFlow',
  brandLogoAlt: 'TaskFlow Logo',
  title: 'Welcome back',
  subtitle: 'Sign in to your workspace to continue.',

  // Form Field Labels
  emailLabel: 'Work email',
  emailIconAlt: 'Email Icon',
  passwordLabel: 'Password',
  passwordIconAlt: 'Password Icon',
  keepSignedInLabel: 'Keep me signed in',
  forgotPasswordText: 'Forgot password?',
  showPasswordText: 'Show password',
  hidePasswordText: 'Hide password',
  submitButtonText: 'Sign in',
  submittingButtonText: 'Signing in...',

  // Placeholders
  emailPlaceholder: 'you@company.com',
  passwordPlaceholder: '••••••••',

  // Validation Error Messages
  errors: {
    emailRequired: 'Work email is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    defaultSubmitError: 'Failed to sign in. Please check your credentials and try again.',
  },

  // Footer & Help
  footerPrompt: 'New to TaskFlow?',
  footerActionText: 'Ask your admin for an invite.',

  // Links
  forgotPasswordHref: '/auth/forgot-password',
  inviteHref: 'mailto:admin@taskflow.io?subject=Request%20TaskFlow%20Workspace%20Invite',

  // Metadata / SEO
  metadata: {
    title: 'Sign In',
    flow: 'Auth',
    description: 'Sign in to your TaskFlow workspace to manage tasks, sprints, and team workflows.',
  },
} as const;

export default LOGIN_CONSTANTS;
