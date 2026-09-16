import { loginSchema, forgotPasswordSchema } from './auth';

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
});
