import { UniqueEntityID } from '@app/shared/domain';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import { AdminUser } from './admin-user.aggregate';

describe('AdminUser Aggregate', () => {
  it('should create a valid admin user', () => {
    const userOrError = AdminUser.create({
      name: 'Admin Name',
      email: 'admin@example.com',
      phone: '123456789',
      passwordHash: 'hashed_password',
    });

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;
    const user = userOrError.value;

    expect(user.name).toBe('Admin Name');
    expect(user.email).toBe('admin@example.com');
    expect(user.phone).toBe('123456789');
    expect(user.passwordHash).toBe('hashed_password');
    expect(user.id).toBeDefined();
  });

  it('should fail to create an admin user with invalid email', () => {
    const userOrError = AdminUser.create({
      name: 'Admin Name',
      email: 'invalid-email',
      phone: '123456789',
      passwordHash: 'hashed_password',
    });

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserEmailError);
  });

  it('should create an admin user with a specific ID', () => {
    const id = UniqueEntityID.create();
    const userOrError = AdminUser.create(
      {
        name: 'Admin Name',
        email: 'admin@example.com',
        phone: '123456789',
        passwordHash: 'hashed_password',
      },
      id,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;

    expect(userOrError.value.id.equals(id)).toBe(true);
  });
});
