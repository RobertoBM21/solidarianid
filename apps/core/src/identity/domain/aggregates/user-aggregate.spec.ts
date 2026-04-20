import { UniqueEntityID } from '@app/shared/domain';
import { InvalidUserNameError } from '@app/shared/domain/value-objects/user-name.vo';
import { InvalidUserPhoneError } from '@app/shared/domain/value-objects/user-phone.vo';
import { PasswordHasherAdapter } from '@app/shared/infrastructure';
import { InvalidUserCityError } from '../value-objects/user-city.vo';
import { InvalidUserCountryError } from '../value-objects/user-country.vo';
import { User } from './user.aggregate';

describe('User Aggregate', () => {
  const DEFAULT_NAME = 'User Name';
  const DEFAULT_EMAIL = 'user@example.com';
  const DEFAULT_PHONE = '12345678';
  const DEFAULT_PASSWORD = 'password';
  const DEFAULT_PASSWORD_HASH = 'hashed_password';
  const DEFAULT_CITY = 'user city';
  const DEFAULT_COUNTRY = 'us';

  const mockCountryChecker = {
    isValidCountryCode: () => true,
  };
  const passwordHasher = new PasswordHasherAdapter();

  // Basic path tests

  // 1. S1-C1-S2-FIN
  it('should fail to create a user with invalid name', async () => {
    const userOrError = await User.create(
      {
        name: '',
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        password: DEFAULT_PASSWORD,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
      passwordHasher,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserNameError);
  });

  // 2. S1-C1-S3-C2-S4-FIN
  it('should fail to create a user with invalid city', async () => {
    const userOrError = await User.create(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        password: DEFAULT_PASSWORD,
        city: '',
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
      passwordHasher,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserCityError);
  });

  // 3. S1-C1-S3-C2-S5-C3-S6-FIN
  it('should fail to create a user with invalid country', async () => {
    const userOrError = await User.create(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        password: DEFAULT_PASSWORD,
        city: DEFAULT_CITY,
        country: '',
      },
      mockCountryChecker,
      passwordHasher,
    );

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserCountryError);
  });

  // 4. S1-C1-S3-C2-S5-C3-S7-C4-S8-S10-FIN
  it('should create a user with a specific ID', async () => {
    const id = UniqueEntityID.create();
    const userOrError = await User.create(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        password: DEFAULT_PASSWORD,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
      passwordHasher,
      id.value,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;

    expect(userOrError.value.id.equals(id)).toBe(true);
  });

  // 5. S1-C1-S3-C2-S5-C3-S7-C4-S9-S10-FIN
  it('should create a valid user', async () => {
    const userOrError = await User.create(
      {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
        phone: DEFAULT_PHONE,
        password: DEFAULT_PASSWORD,
        city: DEFAULT_CITY,
        country: DEFAULT_COUNTRY,
      },
      mockCountryChecker,
      passwordHasher,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;
    const user = userOrError.value;

    expect(user.name).toBe(DEFAULT_NAME);
    expect(user.email).toBe(DEFAULT_EMAIL);
    expect(user.phone).toBe(DEFAULT_PHONE);
    const res = await passwordHasher.comparePassword(
      DEFAULT_PASSWORD,
      user.passwordHash!,
    );
    expect(res).toBe(true);
    expect(user.city).toBe(DEFAULT_CITY);
    expect(user.country).toBe(DEFAULT_COUNTRY);
    expect(user.id).toBeDefined();
  });

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

  // 3. S1-C1-S3-C2-S5-C3-S6-FIN
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

  // 4. S1-C1-S3-C2-S5-C3-S7-C4-S8-S10-FIN
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

  // 5. S1-C1-S3-C2-S5-C3-S7-C4-S9-S10-FIN
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

  describe('update', () => {
    const createValidUser = () => {
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
      if (userOrError.isLeft()) throw new Error('Failed to create test user');
      return userOrError.value;
    };

    it('should update all fields successfully', () => {
      const user = createValidUser();

      const result = user.update(
        {
          name: 'New Name',
          phone: '87654321',
          city: 'new city',
          country: 'es',
        },
        mockCountryChecker,
      );

      expect(result.isRight()).toBe(true);
      expect(user.name).toBe('New Name');
      expect(user.phone).toBe('87654321');
      expect(user.city).toBe('new city');
      expect(user.country).toBe('es');
    });

    it('should update only name', () => {
      const user = createValidUser();

      const result = user.update({ name: 'Updated Name' }, mockCountryChecker);

      expect(result.isRight()).toBe(true);
      expect(user.name).toBe('Updated Name');
      expect(user.phone).toBe(DEFAULT_PHONE);
      expect(user.city).toBe(DEFAULT_CITY);
      expect(user.country).toBe(DEFAULT_COUNTRY);
    });

    it('should update only phone', () => {
      const user = createValidUser();

      const result = user.update({ phone: '99999999' }, mockCountryChecker);

      expect(result.isRight()).toBe(true);
      expect(user.phone).toBe('99999999');
      expect(user.name).toBe(DEFAULT_NAME);
    });

    it('should update only city', () => {
      const user = createValidUser();

      const result = user.update({ city: 'another city' }, mockCountryChecker);

      expect(result.isRight()).toBe(true);
      expect(user.city).toBe('another city');
      expect(user.name).toBe(DEFAULT_NAME);
    });

    it('should update only country', () => {
      const user = createValidUser();

      const result = user.update({ country: 'fr' }, mockCountryChecker);

      expect(result.isRight()).toBe(true);
      expect(user.country).toBe('fr');
      expect(user.name).toBe(DEFAULT_NAME);
    });

    it('should fail with invalid name', () => {
      const user = createValidUser();

      const result = user.update({ name: '' }, mockCountryChecker);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidUserNameError);
      }
      expect(user.name).toBe(DEFAULT_NAME);
    });

    it('should fail with invalid phone', () => {
      const user = createValidUser();

      const result = user.update({ phone: '' }, mockCountryChecker);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidUserPhoneError);
      }
      expect(user.phone).toBe(DEFAULT_PHONE);
    });

    it('should fail with invalid city', () => {
      const user = createValidUser();

      const result = user.update({ city: '' }, mockCountryChecker);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidUserCityError);
      }
      expect(user.city).toBe(DEFAULT_CITY);
    });

    it('should fail with invalid country', () => {
      const user = createValidUser();
      const invalidCountryChecker = { isValidCountryCode: () => false };

      const result = user.update({ country: 'xx' }, invalidCountryChecker);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InvalidUserCountryError);
      }
      expect(user.country).toBe(DEFAULT_COUNTRY);
    });

    it('should not modify other fields when one field update fails', () => {
      const user = createValidUser();

      const result = user.update(
        { name: 'Valid Name', phone: '' },
        mockCountryChecker,
      );

      expect(result.isLeft()).toBe(true);
      expect(user.name).toBe('Valid Name');
      expect(user.phone).toBe(DEFAULT_PHONE);
    });
  });
});
