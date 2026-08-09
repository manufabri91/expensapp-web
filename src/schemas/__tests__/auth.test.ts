import { loginSchema, registerSchema } from '@/schemas/auth';

describe('loginSchema', () => {
  it('accepts a valid login', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'secret', remember: false }).success).toBe(
      true
    );
  });

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'secret', remember: false }).success).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: '', remember: false }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'user@example.com',
    password: 'secret123',
    passwordRepeat: 'secret123',
    remember: false,
    firstName: 'Jane',
    lastName: 'Doe',
    userName: 'janedoe',
    acceptedTerms: true,
  };

  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...valid, passwordRepeat: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['passwordRepeat']);
    }
  });

  it('rejects a missing required field', () => {
    const { firstName, ...withoutFirstName } = valid;
    void firstName;
    expect(registerSchema.safeParse(withoutFirstName).success).toBe(false);
  });

  it('rejects when the terms checkbox is not accepted', () => {
    const result = registerSchema.safeParse({ ...valid, acceptedTerms: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['acceptedTerms']);
    }
  });
});
