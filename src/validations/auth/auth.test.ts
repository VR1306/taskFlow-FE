import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const validData = {
        email: 'user@company.com',
        password: 'securePassword123',
        rememberMe: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@company.com');
        expect(result.data.password).toBe('securePassword123');
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it('allows rememberMe to be omitted', () => {
      const validData = {
        email: 'user@company.com',
        password: 'securePassword123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBeUndefined();
      }
    });

    test.each([
      {
        scenario: 'email is empty',
        data: { email: '', password: 'securePassword123' },
        expectedError: 'Work email is required',
      },
      {
        scenario: 'email format is invalid',
        data: { email: 'invalid-email', password: 'securePassword123' },
        expectedError: 'Please enter a valid work email address',
      },
      {
        scenario: 'password is empty',
        data: { email: 'user@company.com', password: '' },
        expectedError: 'Password is required',
      },
      {
        scenario: 'password is less than 6 characters',
        data: { email: 'user@company.com', password: '123' },
        expectedError: 'Password must be at least 6 characters',
      },
    ])('fails when $scenario', ({ data, expectedError }) => {
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(expectedError);
      }
    });
  });

  describe('forgotPasswordSchema', () => {
    it('validates correct email', () => {
      const validData = {
        email: 'user@company.com',
      };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@company.com');
      }
    });

    test.each([
      {
        scenario: 'email is empty',
        data: { email: '' },
        expectedError: 'Work email is required',
      },
      {
        scenario: 'email format is invalid',
        data: { email: 'not-an-email' },
        expectedError: 'Please enter a valid work email address',
      },
    ])('fails when $scenario', ({ data, expectedError }) => {
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(expectedError);
      }
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates matching passwords with 8 or more characters', () => {
      const validData = {
        password: 'NewStrongPassword@123',
        confirmPassword: 'NewStrongPassword@123',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe('NewStrongPassword@123');
        expect(result.data.confirmPassword).toBe('NewStrongPassword@123');
      }
    });

    test.each([
      {
        scenario: 'password is empty',
        data: { password: '', confirmPassword: '' },
        expectedError: 'Password is required',
      },
      {
        scenario: 'password is less than 8 characters',
        data: { password: 'short', confirmPassword: 'short' },
        expectedError: 'Password must be at least 8 characters',
      },
      {
        scenario: 'confirm password is empty',
        data: { password: 'ValidPassword123', confirmPassword: '' },
        expectedError: 'Please confirm your password',
      },
      {
        scenario: 'passwords do not match',
        data: { password: 'ValidPassword123', confirmPassword: 'DifferentPassword456' },
        expectedError: 'Passwords do not match',
      },
    ])('fails when $scenario', ({ data, expectedError }) => {
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(expectedError);
      }
    });
  });
});
