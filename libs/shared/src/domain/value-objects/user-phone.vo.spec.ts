import { UserPhone, InvalidUserPhoneError } from './user-phone.vo';

describe('UserPhone Value Object', () => {
  it('should create a UserPhone with valid format', () => {
    const result = UserPhone.create('+1234567890');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('+1234567890');
    }
  });

  it('should return error for empty phone', () => {
    const result = UserPhone.create('');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserPhoneError);
    }
  });

  it('should return error for invalid phone format', () => {
    const result = UserPhone.create('invalid-phone');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserPhoneError);
    }
  });
});
