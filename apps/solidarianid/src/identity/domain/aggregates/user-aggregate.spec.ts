import { UniqueEntityID } from '@app/shared/domain';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import { User } from './user.aggregate';

describe('User Aggregate', () => {
  it('should create a valid user', () => {
    const userOrError = User.create({
      name: 'User Name',
      email: 'user@example.com',
      phone: '123456789',
      passwordHash: 'hashed_password',
      city: 'user city',
      country: 'es',
    });

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;
    const user = userOrError.value;

    expect(user.name).toBe('User Name');
    expect(user.email).toBe('user@example.com');
    expect(user.phone).toBe('123456789');
    expect(user.passwordHash).toBe('hashed_password');
    expect(user.city).toBe('user city');
    expect(user.country).toBe('es');
    expect(user.id).toBeDefined();
  });

  it('should fail to create a user with invalid email', () => {
    const userOrError = User.create({
      name: 'User Name',
      email: 'invalid-email',
      phone: '123456789',
      passwordHash: 'hashed_password',
      city: 'user city',
      country: 'de',
    });

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserEmailError);
  });

  it('should create a user with a specific ID', () => {
    const id = UniqueEntityID.create();
    const userOrError = User.create(
      {
        name: 'User Name',
        email: 'user@example.com',
        phone: '123456789',
        passwordHash: 'hashed_password',
        city: 'user city',
        country: 'jp',
      },
      id.value,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;

    expect(userOrError.value.id.equals(id)).toBe(true);
  });
});
