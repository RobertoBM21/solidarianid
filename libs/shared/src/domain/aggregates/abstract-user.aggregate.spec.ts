import {
  Either,
  left,
  PasswordHasherPort,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { InvalidUserEmailError } from '@app/shared/domain/value-objects/user-email.vo';
import {
  AbstractUser,
  AbstractUserCreationError,
  AbstractUserProps,
} from './abstract-user.aggregate';

describe('AbstractUser Aggregate', () => {
  const mockHasher = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  class TestUser extends AbstractUser<AbstractUserProps> {
    static async create(
      data: {
        name: string;
        email: string;
        phone: string;
        password: string;
      },
      passwordHasher: PasswordHasherPort,
    ): Promise<Either<AbstractUserCreationError, TestUser>> {
      const propsOrError = await this.prepare(data, passwordHasher);
      if (propsOrError.isLeft()) {
        return left(propsOrError.value);
      }
      return right(new TestUser(propsOrError.value));
    }

    static createWithHashed(
      data: {
        name: string;
        email: string;
        phone: string;
        hashedPassword: string;
      },
      id?: UniqueEntityID,
    ): Either<AbstractUserCreationError, TestUser> {
      const propsOrError = this.prepareWithHashed(data);
      if (propsOrError.isLeft()) {
        return left(propsOrError.value);
      }
      return right(new TestUser(propsOrError.value, id));
    }
  }

  it('should create a valid admin user', async () => {
    const hashedPassword = 'hashed_password123';
    mockHasher.hashPassword.mockResolvedValue(hashedPassword);

    const userOrError = await TestUser.create(
      {
        name: 'Admin Name',
        email: 'admin@example.com',
        phone: '123456789',
        password: 'password123',
      },
      mockHasher,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;
    const user = userOrError.value;

    expect(user.name).toBe('Admin Name');
    expect(user.email).toBe('admin@example.com');
    expect(user.phone).toBe('123456789');
    expect(user.passwordHash).toBe(hashedPassword);
    expect(user.id).toBeDefined();
  });

  it('should create a valid admin user with hashed password', () => {
    const userOrError = TestUser.createWithHashed({
      name: 'Admin Name',
      email: 'admin@example.com',
      phone: '123456789',
      hashedPassword: 'hashed_password',
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
    const userOrError = TestUser.createWithHashed({
      name: 'Admin Name',
      email: 'invalid-email',
      phone: '123456789',
      hashedPassword: 'hashed_password',
    });

    expect(userOrError.isLeft()).toBe(true);
    if (userOrError.isRight()) return;

    expect(userOrError.value).toBeInstanceOf(InvalidUserEmailError);
  });

  it('should create an admin user with a specific ID', () => {
    const id = UniqueEntityID.create();
    const userOrError = TestUser.createWithHashed(
      {
        name: 'Admin Name',
        email: 'admin@example.com',
        phone: '123456789',
        hashedPassword: 'hashed_password',
      },
      id,
    );

    expect(userOrError.isRight()).toBe(true);
    if (userOrError.isLeft()) return;

    expect(userOrError.value.id.equals(id)).toBe(true);
  });
});
