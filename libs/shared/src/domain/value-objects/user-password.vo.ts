import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';
import { PasswordHasherPort } from '../ports/password-hasher.port';

export class InvalidUserPasswordError implements DomainError {
  message = 'Passwords must be at least 8 characters long.';
}

export class UserPassword extends ValueObject<string> {
  private static readonly MIN_PASSWORD_LENGTH = 8;

  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static async create(
    rawPassword: string,
    hasher: PasswordHasherPort,
  ): Promise<Either<InvalidUserPasswordError, UserPassword>> {
    if (rawPassword.length < this.MIN_PASSWORD_LENGTH) {
      return left(new InvalidUserPasswordError());
    }

    const hashedPassword = await hasher.hashPassword(rawPassword);
    return right(new UserPassword(hashedPassword));
  }

  static fromHashed(hashedPassword: string): UserPassword {
    return new UserPassword(hashedPassword);
  }
}
