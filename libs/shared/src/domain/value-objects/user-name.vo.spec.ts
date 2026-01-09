import { InvalidUserNameError, UserName } from './user-name.vo';

describe('UserName Value Object', () => {
  // Basic path tests

  // 1. S1-C1-S2-FIN
  it('should return an error for a name that is too short', () => {
    const result = UserName.create('A');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidUserNameError);
      expect(error.message).toContain(
        'User name must be between 2 and 100 characters long',
      );
    }
  });

  // 2. S1-C1-C2-S2-FIN
  it('should return an error for a name that is too long', () => {
    const longName = 'A'.repeat(101);

    const result = UserName.create(longName);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidUserNameError);
      expect(error.message).toContain(
        'User name must be between 2 and 100 characters long',
      );
    }
  });

  // 3. S1-C1-C2-S3-FIN
  it('should create a UserName with valid length', () => {
    const result = UserName.create('Valid User');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const userName = result.value;
      expect(userName.value).toBe('Valid User');
    }
  });
});
