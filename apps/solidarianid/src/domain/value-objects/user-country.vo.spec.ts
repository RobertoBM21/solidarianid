import { InvalidUserCountryError, UserCountry } from './user-country.vo';

describe('User country value object', () => {
  it('should create a valid user country', () => {
    const result = UserCountry.create('es');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const userCountry = result.value;
      expect(userCountry.value).toBe('es');
    }
  });

  it('should return an error when the country name is empty', () => {
    const result = UserCountry.create('');

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserCountryError);
    }
  });

  it('should return an error when the country name length is too long', () => {
    const longCountryName = 'esp';
    const result = UserCountry.create(longCountryName);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserCountryError);
    }
  });
});
