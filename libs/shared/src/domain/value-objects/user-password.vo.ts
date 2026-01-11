import {
  DomainError,
  Either,
  left,
  right,
  ValueObject,
} from '@app/shared/domain';

export class InvalidUserPasswordError implements DomainError {
  constructor(public readonly message: string) {}
}

export class UserPassword extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  get value(): string {
    return this.props;
  }

  static create(
    passwordHash: string,
  ): Either<InvalidUserPasswordError, UserPassword> {
    if (!passwordHash) {
      return left(
        new InvalidUserPasswordError('User password hash cannot be empty.'),
      );
    }

    return right(new UserPassword(passwordHash));
  }
}
