import { UniqueEntityID } from '@app/shared/domain';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import { InvalidUserNameError } from '@app/shared/domain/value-objects/user-name.vo';
import { InvalidUserPhoneError } from '@app/shared/domain/value-objects/user-phone.vo';
import { InvalidUserCityError } from '../value-objects/user-city.vo';
import { InvalidUserCountryError } from '../value-objects/user-country.vo';
import { User } from './user.aggregate';

describe('User Aggregate', () => {
  const DEFAULT_NAME = 'User Name';
  const DEFAULT_EMAIL = 'user@example.com';
  const DEFAULT_PHONE = '12345678';
  const DEFAULT_PASSWORD_HASH = 'hashed_password';
  const DEFAULT_CITY = 'user city';
  const DEFAULT_COUNTRY = 'us';

  const mockCountryChecker = {
    isValidCountryCode: () => true,
  };

  // Basic path tests

  // 1. S1-C1-S2-FIN
  it('should fail to create a user with invalid name', () => {
    const userOrError = User.createWithHashed(
      {
        name: '',
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        hashedPassword: DEFAULT_PASSWORD_HASH,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserNameError);
  });

  // 2. S1-C1-S3-C2-S4-FIN
  it('should fail to create a user with invalid email', () => {
    const userOrError = User.createWithHashed(
      {
        name: DEFAULT_NAME,
        email: '',
        phone: DEFAULT_PHONE,
        hashedPassword: DEFAULT_PASSWORD_HASH,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserEmailError);
  });

  // 3. S1-C1-S3-C2-S5-C3-S6-FIN
  it('should fail to create a user with invalid phone', () => {
    const userOrError = User.createWithHashed(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: '',
        hashedPassword: DEFAULT_PASSWORD_HASH,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserPhoneError);
  });

  // 5. S1-C1-S3-C2-S5-C3-S7-C4-S9-C5-S10-FIN
  it('should fail to create a user with invalid city', () => {
    const userOrError = User.createWithHashed(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        hashedPassword: DEFAULT_PASSWORD_HASH,
        city: '',
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserCityError);
  });

  // 6. S1-C1-S3-C2-S5-C3-S7-C4-S9-C5-S11-C6-S12-FIN
  it('should fail to create a user with invalid country', () => {
    const userOrError = User.createWithHashed(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        hashedPassword: DEFAULT_PASSWORD_HASH,
        city: DEFAULT_CITY,
        country: '',
      },
      mockCountryChecker,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserCountryError);
  });

  // 7. S1-C1-S3-C2-S5-C3-S7-C4-S9-C5-S11-C6-S13-C7-S14-S16-FIN
  it('should create a user with a specific ID', () => {
    const id = UniqueEntityID.create();
    const userOrError = User.createWithHashed(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        hashedPassword: DEFAULT_PASSWORD_HASH,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
      id.value,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;

    expect(userOrError.value.id.equals(id)).toBe(true);
  });

  // 8. S1-C1-S3-C2-S5-C3-S7-C4-S9-C5-S11-C6-S13-C7-S15-S16-FIN
  it('should create a valid user', () => {
    const userOrError = User.createWithHashed(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        hashedPassword: DEFAULT_PASSWORD_HASH,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;
    const user = userOrError.value;

    expect(user.name).toBe(DEFAULT_NAME);
    expect(user.email).toBe(DEFAULT_EMAIL);
    expect(user.phone).toBe(DEFAULT_PHONE);
    expect(user.passwordHash).toBe(DEFAULT_PASSWORD_HASH);
    expect(user.city).toBe(DEFAULT_CITY);
    expect(user.country).toBe(DEFAULT_COUNTRY);
    expect(user.id).toBeDefined();
  });
});
