import { UserPassword, InvalidUserPasswordError } from './user-password.vo';

describe('UserPassword Value Object', () => {
  it('should create a UserPassword with valid hash', () => {
    const result = UserPassword.create('hashed_password_123');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('hashed_password_123');
    }
  });

  it('should return error for empty password hash', () => {
    const result = UserPassword.create('');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserPasswordError);
    }
  });
});
