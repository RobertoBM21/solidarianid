import { InvalidUserPasswordError, UserPassword } from './user-password.vo';

describe('UserPassword Value Object', () => {
  // Basic path tests

  // 1. C1-S1-FIN
  it('should return error for empty password hash', () => {
    const result = UserPassword.create('');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserPasswordError);
      expect(result.value.message).toBe('User password hash cannot be empty.');
    }
  });

  // 2. C1-S2-FIN
  it('should create a UserPassword with valid hash', () => {
    const result = UserPassword.create('hashed_password_123');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('hashed_password_123');
    }
  });
});
