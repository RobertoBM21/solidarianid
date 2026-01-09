import { InvalidUserEmailError, UserEmail } from './user-email.vo';

describe('UserEmail Value Object', () => {
  it('should normalize email to lowercase', () => {
    const result = UserEmail.create('TEST@Example.COM');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('test@example.com');
    }
  });

  // Basic path tests

  // 1. S1-C1-S2-FIN
  it('should return error for empty email', () => {
    const result = UserEmail.create('');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserEmailError);
    }
  });

  // 2. S1-C1-C2-S3-FIN
  it('should return error for invalid email format', () => {
    const result = UserEmail.create('invalid-email');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserEmailError);
    }
  });

  // 3. S1-C1-C2-S4-FIN
  it('should create a UserEmail with valid format', () => {
    const result = UserEmail.create('test@example.com');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('test@example.com');
    }
  });
});
