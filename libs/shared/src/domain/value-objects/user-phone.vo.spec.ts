import { InvalidUserPhoneError, UserPhone } from './user-phone.vo';

describe('UserPhone Value Object', () => {
  // Basic path tests

  // 1. S1-C1-S2-FIN
  it('should return error for empty phone', () => {
    const result = UserPhone.create('');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserPhoneError);
      expect(result.value.message).toBe('User phone cannot be empty.');
    }
  });

  // 2. S1-C1-C2-S3-FIN
  it('should return error for invalid phone format', () => {
    const result = UserPhone.create('invalid-phone');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserPhoneError);
      expect(result.value.message).toBe('Invalid user phone format.');
    }
  });

  // 3. S1-C1-C2-S4-FIN
  it('should create a UserPhone with valid format', () => {
    const result = UserPhone.create('+1234567890');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('+1234567890');
    }
  });
});
