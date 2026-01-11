import {
  Either,
  left,
  PasswordHasherPort,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import {
  AbstractUser,
  AbstractUserCreationError,
  AbstractUserProps,
} from '@app/shared/domain/aggregates/abstract-user.aggregate';

export type AdminUserProps = AbstractUserProps;

export type AdminUserCreationError = AbstractUserCreationError;

export class AdminUser extends AbstractUser<AdminUserProps> {
  static async create(
    data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    },
    passwordHasher: PasswordHasherPort,
  ): Promise<Either<AdminUserCreationError, AdminUser>> {
    const propsOrError = await this.prepare(data, passwordHasher);
    if (propsOrError.isLeft()) {
      return left(propsOrError.value);
    }
    return right(new AdminUser(propsOrError.value));
  }

  static createWithHashed(
    data: {
      name: string;
      email: string;
      phone: string;
      hashedPassword: string;
    },
    id?: UniqueEntityID,
  ): Either<AdminUserCreationError, AdminUser> {
    const propsOrError = this.prepareWithHashed(data);
    if (propsOrError.isLeft()) {
      return left(propsOrError.value);
    }
    return right(new AdminUser(propsOrError.value, id));
  }
}
