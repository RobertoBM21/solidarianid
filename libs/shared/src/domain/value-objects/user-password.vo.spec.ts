import { InvalidUserPasswordError, UserPassword } from './user-password.vo';

describe('UserPassword Value Object', () => {
  const mockHasher = {
    // eslint-disable-next-line @typescript-eslint/require-await
    hashPassword: async (password: string): Promise<string> => {
      return `hashed_${password}`;
    },
    comparePassword: jest.fn(),
  };

  it('should create a UserPassword with valid hash', () => {
    const result = UserPassword.fromHashed('hashed_password_123');
    expect(result.value).toBe('hashed_password_123');
  });

  // Basic path tests

  // 1. C1-S1-S3-FIN
  it('should return error if the password is too short', async () => {
    const result = await UserPassword.create('123', mockHasher);
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserPasswordError);
      expect(result.value.message).toBe(
        'Passwords must be at least 8 characters long.',
      );
    }
  });

  // 2. C1-S2-S3-FIN
  it('should create a UserPassword with valid password', async () => {
    const result = await UserPassword.create('validPassword', mockHasher);
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toBeInstanceOf(UserPassword);
      expect(result.value.value).toBe('hashed_validPassword');
    }
  });
});
