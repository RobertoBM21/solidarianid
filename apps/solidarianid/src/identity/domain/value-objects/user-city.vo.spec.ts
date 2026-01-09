import { InvalidUserCityError, UserCity } from './user-city.vo';

describe('User city value object', () => {
  // Basic path tests

  // 1. S1-S2-C1-S3-FIN
  it('should return an error when the city name is empty', () => {
    const result = UserCity.create('');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidUserCityError);
      expect(error.message).toBe(`User city cannot be empty.`);
    }
  });

  // 2. S1-S2-C1-C2-S4-FIN
  it('should return an error when the city name length is too long', () => {
    const longCityName = 'A'.repeat(129);
    const result = UserCity.create(longCityName);
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidUserCityError);
      expect(error.message).toBe(`User city must not exceed 128 characters.`);
    }
  });

  // 3. S1-S2-C1-C2-S5-FIN
  it('should create a valid user city', () => {
    const result = UserCity.create('Murcia');
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const userCity = result.value;
      expect(userCity.value).toBe('Murcia');
    }
  });
});
